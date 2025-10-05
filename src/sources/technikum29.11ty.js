export const source = {
  meta: {
    id: "t29-blog",
    title: "technikum29 Blog",
    human_url: "https://technikum29.de/blog/",
    icon: "/assets/icons/museum.png",
    data_url: "https://technikum29.de/blog/feed.xml",
    local_file: "t29-blog-feed.xml",
    description: `
      The [technikum29 blog](https://technikum29.de/blog) is the news feed of
      my [computer museum technikum29](/misc/#technikum29). Postings are written by a small authoring team
      and nowadays only the minority of postings is written by me. This information is "authorative", i.e.
      the museum maintains no social media stream with news.
    `,
    list_outgoing_links: true,
  },
  
  pagination: {
    data: "t29-blog-feed.rss.channel.item",
    size: 1,
    alias: "item",
    addAllPagesToCollections: true,
  },
  
  // TODO: Extract the "Origin URL" which is typically short.
  permalink: function({item}) {
    return `/blog/technikum29/${this.dateFormat(item.pubDate)}-${this.slug(item.title)}.html`
  },
  
  tags: [ "t29-blog", "aggregated" ],
  
  layout: "rss-excerpt.njk",
  
  eleventyComputed: {
    title: data => data.item.title,
    date: data => data.item.pubDate,
    link: data => data.item.link,
  }
};

export default class { data() { return source; } }
