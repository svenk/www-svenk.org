
// Nginx reverse-proxies this URL to my little go matrix bridge server, which does
// not care about the URLs as there is only one entry point.
const bridge_url_relative = "/chat/socket"
let bride_url;

if(location.hostname == "localhost") {
  // this is the 11ty development setting. Unfortunately, 11ty upgrades to their
  // hot reloading websocket from any path, interfering with out stuff.
  // Therefore, instead connect to some local dev server, too.
  bridge_url = "ws://127.0.0.1:18081"
} else {
  // make an absolute wss?:// URL out of it
  bridge_url = new URL(bridge_url_relative, location.href);
  bridge_url.protocol = bridge_url.protocol === "https:" ? "wss:" : "ws:";
}

// defines time intervals for reachability probabilities.
// times are in CET/CEST 24 hours
var awakeness = { 0: .2, 3: 0., 6: .6, 8: 1., 23: .5 }

function getAwakeness(t) {
  t = (t+24)%24;
  const times = Object.keys(awakeness).map(Number).sort((a,b)=>a-b);
  for (let i=0;i<times.length;i++) {
    const t0 = times[i], t1 = times[(i+1)%times.length] + (i+1===times.length?24:0);
    if (t>=t0 && t<t1) {
      const y0 = awakeness[t0], y1 = awakeness[times[(i+1)%times.length]];
      // linear interpolation function
      return y0 + (y1-y0)*(t-t0)/(t1-t0);
    }
  }
}

function curHoursCET() { ///< Current fractional hours in CET/CEST
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const h24 = parseInt(parts.find(p => p.type === 'hour').value, 10);
  const minutes = parseInt(parts.find(p => p.type === 'minute').value, 10);

  const h24frac = h24 + minutes / 60;
  const ampm = h24 >= 12 ? 'pm' : 'am';
  const h12 = (h24 % 12) || 12;
  const h12ampm = `${h12}${ampm}`;
  const hh = String(h24).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const hhmm = `${hh}:${mm}`;

  return { h24frac, h12ampm, hhmm };
}


const formatPercent = p => (p*100).toFixed(0) + "%";

const curAwakenessPercent = formatPercent(getAwakeness(curHoursCET().h24frac))
const curLocalTimeFormatted = curHoursCET().h12ampm

// curently unused functionality
const tpldata = { curAwakenessPercent, curLocalTimeFormatted, }
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-insert]").forEach(el => {
    const key=el.dataset.insert;
    if (key && key in tpldata) el.textContent = tpldata[key];
  })
})

function playPling() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") return // be unobstructive and do not clutter console

  // main oscillator (bright tone)
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, ctx.currentTime); // start high

  // amplitude envelope
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01); // quick attack
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5); // smooth decay

  // optional overtone (slight bell-like quality)
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1800, ctx.currentTime); // harmonic
  osc2.detune.setValueAtTime(10, ctx.currentTime); // slight detune for realism

  // connect
  osc.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  // start + stop
  osc.start();
  osc2.start();
  osc.stop(ctx.currentTime + 0.6);
  osc2.stop(ctx.currentTime + 0.6);
}

const notifyTitle = (() => {
  let unread = 0;
  const base = document.title;

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      unread = 0;
      document.title = base;
    }
  });

  return () => {
    if (document.hidden) document.title = `(${++unread}) ${base}`;
  };
})();


function WsMatrixChat(WS_URL) {
  const chat = document.querySelector("section.chat")
  const chat_available_listeners = document.querySelectorAll(".if-chat-available")
  const form = chat?.querySelector("form")
  const form_elements = chat?.querySelectorAll("textarea, input, button")
  const output = chat?.querySelector(".output");
  const output_template = output?.querySelector("template")
  const textarea = chat?.querySelector("textarea");
  const input_elements = chat?.querySelectorAll("textarea, input")

  let ws = null;
  let isOpen = false;
  let appendMessageCallback = null
  let isAvailableCallback = null

  function setAvailable(available) {
    isOpen = !!available;
    isAvailableCallback && isAvailableCallback(available)
    form_elements?.forEach(e => e.disabled = !available)
      
    //chat.classList.toggle("available", available);
    //chat.classList.toggle("disabled", !available);

    chat_available_listeners?.forEach(e => {
      e.classList.toggle("available", available)
      e.classList.toggle("disabled", !available)
    })
  }
  
  function isAvailable() {
    return isOpen
  }

  function appendMessage(data, cls) {
    data.time = curHoursCET().hhmm
    
    appendMessageCallback && appendMessageCallback(data, cls)
    if(!output_template) {
      console.warn("Cannot use appendMessage if there is no matrix form on this page.")
      return
    }
      
    const li = output_template.content.cloneNode(true)
    
    // our little template language implementation
    li.querySelectorAll('[data-class]').forEach(el => {
      el.classList.add(cls || data.cls);
      el.removeAttribute('data-class');
    });

    li.querySelectorAll('[data-content]').forEach(el => {
      const key = el.getAttribute('data-content');
      const dom_attr = "display_as_html" in data ? "innerHTML" : "textContent"
      if (key in data) el[dom_attr] = data[key];
      el.removeAttribute('data-content');
    });
    
    output.appendChild(li)
    
    // scroll to end of page
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  }

  function whenAppendMessage(callback) {
    appendMessageCallback = callback
  }
  
  function whenAvailable(callback) {
    isAvailableCallback = callback
  }

  function sendMessage() {
    if (!isOpen) return;
    // collect data
    const formData = new FormData(form);
    const obj = {};
    for (const [key, value] of formData.entries()) obj[key] = value;
    const json = JSON.stringify(obj);
    ws.send(json)
    
    // for display
    if(obj.nickname == "") obj.nickname = "you"
    appendMessage(obj, "sent");
  }

  function handleSubmit(event) {
    const text = textarea.value;
    if (!text.trim()) return;
    sendMessage();
    textarea.value = "";
    textarea.focus();

    event.preventDefault() // avoid page reloading
  }

  form?.addEventListener("submit", handleSubmit);

  input_elements?.forEach(elem => elem.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Enter submits
      handleSubmit(e);
    }
    // in textarea, Shift+Enter falls through to insert newline
  }))

  /** WebSocket lifecycle (also acts as health check on load) */
  function connect() {
    try {
      ws = new WebSocket(WS_URL);

      ws.addEventListener("open", () => setAvailable(true))
      ws.addEventListener("message", (evt) => {
        appendMessage(JSON.parse(String(evt.data)), "recv")
        notifyTitle()
        playPling()
      })
      ws.addEventListener("close", () => setAvailable(false))
      ws.addEventListener("error", () => setAvailable(false))
    } catch (err) {
      setAvailable(false);
    }
  }

  // Cleanly close on page unload
  window.addEventListener("beforeunload", () => {
    try { ws && ws.close(); } catch (_) {}
  });

  // Initial health check: attempt connection
  setAvailable(false);
  connect();

  return { form, appendMessage, whenAppendMessage, isAvailable, whenAvailable }
}

const chat = WsMatrixChat(bridge_url)

// setup a simple browser-local "agent" which acts on the message flow
function setupAgent() {
  // agent identifiers:
  const nickname = "sven (moderator)"
  const cls = "agent" // used withinCSS
  const agent_send = (msg, details) => chat.appendMessage({
      nickname: "sven (moderator)",
      msg,
      cls: "agent",
      ...details // will overwrite
  })

  const unreachable_timeout_sec = 15

  var isFirstMessage = true, gotAnyReply = false
  chat.whenAppendMessage((data, dir) => {
    if(dir == "recv") {
      gotAnyReply = true
    } else if(dir == "sent") {
      if(isFirstMessage) {
        setTimeout(() => {
          if(!gotAnyReply) {
            console.log("Ring ring, but nobody takes up")
            agent_send(`
              Leider scheint derzeit niemand erreichbar zu sein. Wir haben Ihre Nachricht
              aber empfangen, gerne können Sie auch weitere hinterlassen. Sie können
              auch einen konventionelleren Weg wählen und uns einfach eine E-Mail
              schreiben an <a href="mailto:hallo@denktmit.de">hallo@denktmit.de</a>.
              Oder probieren Sie doch uns unter der <a href="tel:+4961719517990">06171 9517990</a>
              anzurufen!
            `, { display_as_html: true })
          }
        }, unreachable_timeout_sec * 1000)
      }
      isFirstMessage = false
    }
  })

  messages = `
  This is a real human conversation, not an AI bot.
  It’s just a fun way to spark a spontaneous exchange.

  My local time in Germany is <strong>${curLocalTimeFormatted}</strong>.
  Right now, there's about a <strong>${curAwakenessPercent} chance</strong>
  that I will reply immediately.
  When you send the first message, my phone usually pings up to <strong>10 seconds later</strong>.
  Once I’ve opened the app, messages arrive instantly.

  You’re welcome to enter your name or stay anonymous if you'd rather.
  `.split("\n\n")

  // Box Muller gaussian
  const randn = () => Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());

  messages.forEach((msg, i) => {
    const mu_ms = 1000
    const sigma_ms = 600 
    var delay = (i + 1) * mu_ms + randn() * sigma_ms/1000;
    delay = 0  // skip the effect right now
    setTimeout(() => agent_send(msg, { display_as_html: true }), /*ms*/delay);
  });
}

chat.whenAvailable((available) => {
  if(available && chat.form) setupAgent() // play agent only when page has a chat form
  chat.whenAvailable(null) // remove handler
})
