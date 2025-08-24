import { liquidDate, dateFormat } from './common.js'

export const source = {
  meta: {
    id: "uniordner",
    title: "Uniordner (historisch)",
    human_url: "http://sven.köppel.org/uni/",
    icon: "/assets/icons/talk.png",
    data_url: "http://sven.köppel.org/uni/cgi-bin/json-uniordner",
    local_file: "uniordner.json",
    skipped_download: true, // because target is currently offline!
    description: `
      The *uniordner* (meaning *university folder*) was a huge and well-maintained repository during my
      study times between 2010 and 2018. This was well-engineered on a NAS and with mod_perl, a
      sophisticated but minimalistic access control system. Some infrastructure is still available at
      [svenk/uniordner at github](https://github.com/svenk/uniordner), but the files are not.
      This used to be hosted at [https://sven.köppel.org](sven.köppel.org).
      Hopefully there is still a copy so this can be properly released one day. Up to then,
      all links are broken.
    `,
  },

  pagination: {
    data: "uniordner",
    size: 1,
    alias: "item",
    addAllPagesToCollections: true,
  },
  
  // permalink TODO: use item.key instead, however it is not always unique.
  permalink: function({item,date}) {
    return `/historical-uniordner/${dateFormat(item.date)}-${this.slug(item.title)}.html`
  },

  eleventyComputed: {
    title: data => data.item.title,
    date: data => dateFormat(data.item.date),
    link: data => data.page.url,
  },

  tags: [ "uniordner", "aggregated" ],
  
  layout: "resource.html",
}

export default class { data() { return source; } }
