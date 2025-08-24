import { dateFormat} from './common.js'

export const source = {
  meta: {
    id: "anabrid-news",
    title: "Anabrid News",
    human_url: "https://anabrid.com/news/",
    icon: "/assets/icons/anabrid.png",
    data_url: "https://anabrid.com/news/feed.xml",
    local_file: "anabrid-news-feed.xml",
    skipped_download: true, // because target is currently offline!
    description: `
      The [anabrid news](https://anabrid.com/news) is a blog-like information website about
      my company [anabrid](/companies/#anabrid). In the past, all entries were written by me. Since
      there was a CMS transition in 2024, the feed and most links are broken. There is a successor
      feed at [anabrid apex](https://anabrid.dev/about/news/) which is however not well alive.
      The best option for company news is the [anabrid feed at Linkedin](https://www.linkedin.com/company/anabrid/).
    `,
  },
  
  pagination: {
    data: "anabrid-news-feed.rss.channel.item",
    size: 1,
    alias: "item",
    addAllPagesToCollections: true,
  },
  
  // TODO: Extract the "Origin URL" which is typically short.
  permalink: function({item}) {
    return `/blog/anabrid/${dateFormat(item.pubDate)}-${this.slug(item.title)}.html`
  },
  
  tags: [ "anabrid-news", "aggregated" ],
  
  layout: "rss-excerpt.html",
  
  eleventyComputed: {
    title: data => data.item.title,
    date: data => dateFormat(data.item.pubDate),
    link: data => data.page.url,
  }
}

export default class { data() { return source; } }
