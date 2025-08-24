import { dateFormat } from './common.js'

export const source = {
  meta: {
    id: "talks",
    title: "Talks",
    human_url: "https://github.com/svenk/publications/",
    icon: "/assets/icons/talk.png",
    local_file: "talks.yaml",
    description: `
      The talks stream stem from [svenk/publications github repository](https://github.com/svenk/publications/)
      which collects scientific papers, scientific talks and thesis.
      This is basically a (poor) kind of successor for my old *uniordner* collection.
    `,
    // TODO: Define download action
  },
  
  pagination: {
    data: "talks.talks",
    size: 1,
    alias: "item",
    addAllPagesToCollections: true,
  },
  
  // permalink TODO: use item.key instead, however it is not always unique.
  permalink: function({item}) {
    return `/talks/${this.dateFormat(item.date)}-${this.slug(item.title)}.html`
  },

  //eleventyExcludeFromCollections: true

  eleventyComputed: {
    title: data => data.item.title
      + (data.item.event ? ` (${data.item.event})` :""),
    date: data => dateFormat(data.item.date),
    link: data => data.page.url,
  },
  
  tags: [ "talks", "aggregated" ],

  layout: "talk.html",
}

export default class { data() { return source; } }
