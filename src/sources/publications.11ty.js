import { dateFormat} from './common.js'


export const source = {
  meta: {
    id: "scientific_publications",
    title: "Publications",
    human_url: "https://github.com/svenk/publications/",
    icon: "/assets/icons/univ.png",
    data_url: "https://raw.githubusercontent.com/svenk/publications/master/Papers/papers-svenk.yaml",
    local_file: "scientific_publications.yaml",
    //fixed_dates: True
    description: `
      The publications stream stem from [svenk/publications github repository](https://github.com/svenk/publications/)
      which collects scientific papers, scientific talks and thesis.
      This is basically a (poor) kind of successor for my old *uniordner* collection.
    `,
  },
  
  pagination: {
    data: "scientific_publications.scientific_publications",
    size: 1,
    alias: "item",
    addAllPagesToCollections: true,
  },
  
  // TODO: Extract the "Origin URL" which is typically short.
  permalink: function({item,date}) {
    return `/publications/${date}-${this.slug(item.title)}.html`
  },

  tags: [ "scientific_publications", "aggregated" ],

  eleventyComputed: {
    title: data => data.item.title,

    // liquids powerful date parser is the only one capable of parsing something like "Jun 2015".
    // luxon cannot do it.
    date: function(data) { return this.renderTemplate(`{{ '${data.item.date}' | date: "%Y-%m-%d" }}`, "liquid") },
    
    link: data => data.page.url,
  },

  layout: "publication.html",
}

export default class { data() { return source; } }
