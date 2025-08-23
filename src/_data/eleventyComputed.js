import { DateTime } from "luxon"

export default {
  //test: (data) => { debugger; },
  
  data_sources: data => {
    // this will "overwrite" similar named tpl.data.meta.id entries many times, which
    // is however not bad because they all stem from the same paginating template in blog/*.html
    // or posts/posts.11data.js, respectively.
    return Object.fromEntries(data.collections.aggregated.map(
      tpl => tpl.data.meta && [ tpl.data.meta.id, tpl.data.meta ]))
  },
  
  data_source_names: data => Object.keys(data.data_sources),
  
  
  // NOPE! Instead get aggregated posts out of collection which is generated
  //       by the individual data
  /*
  aggregated_posts: data => {
    // this is translated aggregate.py logic by AI. Has to be checked and fixed!
    
    const sources = data.data_sources || {}

    const prepend = (key, prefix) => d => (key in d ? prefix + String(d[key]) : null)
    const uniordner = () => d => ("event" in d && "title" in d) ? `${d.title} (${d.event})` : null
    const linklist = (key) => d => (Array.isArray(d[key]) && d[key].length) ? d[key][0] : null
    
    debugger;

    const candidates = {
      title: ["title", uniordner()],
      date:  ["date", "pubDate"],
      link:  ["video","sources","slides","link",
              prepend("DOI","https://dx.doi.org/"),
              prepend("arxiv","https://arxiv.org/abs/"),
              linklist("links")]
    }

    const toDate = (val) => {
      if (val instanceof Date && !isNaN(val)) return val
      const dt = DateTime.fromJSDate(new Date(String(val)))
      return dt.isValid ? dt.toJSDate() : undefined
    }

    const out = []
    for (const [origin, src] of Object.entries(sources)) {
      let arr = Array.isArray(src) ? src
        : (src && typeof src === "object" && Object.keys(src).length === 1 ? src[Object.keys(src)[0]] : null)
      if (!Array.isArray(arr)) continue

      for (const irec of arr) {
        if (!irec || typeof irec !== "object") continue
        const orec = { origin }
        for (const [field, list] of Object.entries(candidates)) {
          for (const cand of list) {
            if (typeof cand === "function") {
              const v = cand(irec); if (v != null) orec[field] = v
            } else if (cand in irec) {
              orec[field] = irec[cand]
            }
          }
        }
        if (orec.date) orec.date = toDate(orec.date)
        out.push(orec)
      }
    }

    out.sort((a,b) => {
      const ta = a.date instanceof Date && !isNaN(a.date) ? a.date.getTime() : -Infinity
      const tb = b.date instanceof Date && !isNaN(b.date) ? b.date.getTime() : -Infinity
      return tb - ta
    })

    return out    
  },
  */
  
  open_graph: {
    title: data => "Sven Köppel: " + (data.open_graph?.title || data.title),
    site_name: "Sven Köppel",
    
    description: data => data.open_graph?.description || "Website of Sven köppel",
     type: "website",

     // TODO: Ensure the image is an absolute URL.
    image: data => data.open_graph.image || data.og_image || data.preview_image || "https://svenk.org/assets/svenk-blue-1920.jpg",
    
    locale: data => data.lang || "en_US",
  }
}
