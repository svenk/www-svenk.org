export default {
  //test: (data) => { debugger; },
  
  
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
