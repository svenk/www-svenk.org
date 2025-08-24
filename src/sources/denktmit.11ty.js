import { dateFormat} from './common.js'

export const source = {
  meta: {
    id: "denktmit-blog",
    title: "DenktMit Blog",
    human_url: "https://denktmit.de/blog/",
    icon: "/assets/icons/code.png",
    data_url: "https://denktmit.de/feed.xml",
    local_file: "denktmit-blog-feed.xml",
    description: `
      The [denktmit tech blog](https://denktmit.de/blog) is the news feed of
      my company [denktmit](/companies/denktmit). In the past, I was the only person blogging there
      regularly, but nowadays there is an editorial team. Therefore, I only wrote a small
      portion of today's posts myself.
    `,
    list_outgoing_links: true,
  },
    
  pagination: {
    data: "denktmit-blog-feed.rss.channel.item",
    size: 1,
    alias: "item",
    addAllPagesToCollections: true,
    before: function(paginationData, fullData) {
        return paginationData.filter(item =>
            item.title.toLowerCase().includes("sven") ||
            item.author?.toLowerCase().includes("sven")
        )
    },
  },
  
  // TODO: Extract the "Origin URL" which is typically short.
  permalink: function({item}) {
    return `/blog/denktmit/${this.dateFormat(item.pubDate)}-${this.slug(item.title)}.html`
  },
  
  tags: [ "denktmit-blog", "aggregated" ],
  
  layout: "rss-excerpt.html",
  
  eleventyComputed: {
    title: data => data.item.title,
    date: data => data.item.pubDate,
    link: data => data.item.link,
  }
};

export default class { data() { return source; } }
