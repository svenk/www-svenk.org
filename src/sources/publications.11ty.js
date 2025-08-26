import { dateFormat, liquidDate } from './common.js'

import { publications_dir, assert_publications } from './talks.11ty.js'
import { cp } from "node:fs/promises";
import { join } from "node:path";


// create normalized items with all-lowercase, because sometimes DOI and doi etc.
const normalized_item = unnormalized_item => Object.keys(unnormalized_item).reduce((acc, key) => {
          acc[key.toLowerCase()] = unnormalized_item[key];
          return acc;
      }, {});

const reference_names = {
  inspire: "Inspire High Energy Physics database",
  arxiv: "ArXiV preprint server",
  doi: "Digital Object Identifier (DOI)",
  urn: "Uniform Resource Name (URN)",
};

const reference_links = unnormalized_item => {
      const item = normalized_item(unnormalized_item)
      
      return{
       ...(item.inspire && {inspire: `<a href="${item.inspire}">Inspire-HEP</a>`}),
       ...(item.arxiv && {arxiv: `<a href="http://arxiv.org/abs/${item.arxiv}">arxiv:${item.arxiv}</a>`}),
       ...(item.doi && {doi: `<a href="http://dx.doi.org/${item.doi }">doi:${item.doi }</a>`}),
       ...(item.urn && {urn: `<a href="https://nbn-resolving.org/${item.urn}">${item.urn}</a>`}),
      }
};


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
    async download() {
      if(!await assert_publications()) return false;
      //console.log(join(publications_dir, "Papers/papers-svenk.yaml"), join("src/_data/", this.local_file))
      return cp(join(publications_dir, "Papers/papers-svenk.yaml"), join("src/_data/", this.local_file))
    }
  },
  
  pagination: {
    data: "scientific_publications.scientific_publications",
    size: 1,
    alias: "item",
    addAllPagesToCollections: true,
  },
  
  // TODO: Extract the "Origin URL" which is typically short.
  permalink: async function({item}) {
    return `/publications/${await liquidDate(this,item.date) }-${this.slug(item.title)}.html`
  },
  
  tags: [ "scientific_publications", "aggregated" ], // cannot be computed
  
  // for lookup access in templates, in combination with reference_links
  reference_names,

  eleventyComputed: {
    title: data => data.item.title,

    // liquids powerful date parser is the only one capable of parsing something like "Jun 2015".
    // luxon cannot do it.
    date: function(data) { return liquidDate(this,data.item.date) },
    
    link: data => data.page.url,
    
    reference_links: data => reference_links(data.item),
    
    //additional_computed_tags: data => data.item.labels?.map(tag => "scientific_publication_with_label_"+tag),
  },

  layout: "publication.njk",
}

export default class { data() { return source; } }
