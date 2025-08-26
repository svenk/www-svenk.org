import { dateFormat } from './common.js'

import { stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const isdir = (dirname) => { try { return stat(dirname).isDirectory(); } catch { return false; } }
const __dirname = dirname(fileURLToPath(import.meta.url));
export const publications_dir = join(__dirname, "../../publications")

export async function assert_publications() {
  /*if(!isdir(publications_dir)) {
      //await execAsync("git clone https://github.com/svenk/publications");
      console.warn("Missing publications directory!");
      return false
  }*/
  return true
}

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
    async download() {
      if(!await assert_publications()) return false;
      const { dump_talks } = await import(join(publications_dir, "Talks", "find-talks.js"))
      dump_talks(join("src/_data/", this.local_file))
    }
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

  layout: "talk.njk",
}

export default class { data() { return source; } }
