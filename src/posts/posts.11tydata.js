export default {
  meta: {
    id: "svenk-local-blog",
    title: "SvenK local Blog",
    human_url: "https://svenk.org/blog/",
    icon: "/assets/icons/essay.png",
    description: `
       This is a small mini-blog hosted on the [svenk](/) website itself. This feature was
       introduced late: For many years, the site was just an aggregator. It happens very
       rarely that I post on my very own website. Reasons can be personal matters that do not
       fit into any professional category.
    `,
  },
  layout: "post",
  eleventyComputed: {
    date: function(data) { return this.dateFormat(data.date || data.page.date); },
    link: data => data.page.url,
    //permalink: data => data.page.url.replace("posts/", "blog/"), //function(data) {return  }//`/blog/{this.dateFormat(data.date || data.page?.date, '%Y-%m-%d')}-${this.slugify(data.title)}.html`; },
  },
  tags: [ "svenk-local-blog", "aggregated" ],
}
