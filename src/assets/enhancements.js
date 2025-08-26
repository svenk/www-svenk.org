
window.addEventListener("DOMContentLoaded", () => {
    
  // fun with <summary> icons
  document.querySelectorAll("details").forEach(details => {
    const summary = details.querySelector("summary");
    if (!summary) return; 
    const updateCursor = () => { summary.style.cursor = details.open ? "zoom-out" : "zoom-in"; }
    updateCursor();
    details.addEventListener("toggle", updateCursor);
  });
    
});
