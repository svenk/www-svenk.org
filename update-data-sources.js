/**
 * This standalone nodejs script prepares data sources for the SSG 11ty.
 * It is supposed to run before 11ty or regularly.
 * Alternatively, 11ty's Fetch plugin could be used, but it is more about
 * hiding the fact that remote stuff was downloaded while this script
 * makes this very official, also by putting stuff dedicatedly to the git
 * stage.
 **/

import { stat, cp } from "node:fs";
import { writeFile } from "node:fs/promises";

// Cache shall be git-tracked
const data_dir = "src/_data/"

// for non-enumerable object members
const load = Symbol()

// idea: Have XML as suffix enlisted in 11ty as RSS loader.
//       apply filter then only afterwards.

const isdir = (dirname) => { try { return statSync(dirname).isDirectory(); } catch { return false; } }

const skip_download = reason => function() { this.skip_download = reason; };

function assert_publications() {
    if(!isdir("publications")) {
        //await execAsync("git clone https://example.com/your/repo.git publications");
        console.warn("Missing publications");
    }
}

function download() {
  if(!this.data_url || !this.local_file) throw new Error("Need data source URL");
  return fetch(this.data_url)
    .then(res => res.arrayBuffer())
    .then(buf => writeFile(data_dir + this.local_file, Buffer.from(buf)))
    .catch(console.error);
}

const data_sources = {
    anabrid_news: {
        title: "Anabrid News",
        human_url: "https://anabrid.com/news/",
        icon: "/assets/icons/anabrid.png",
        data_url: "https://anabrid.com/news/feed.xml",
        local_file: "anabrid-news-feed.xml",
        [load]: skip_download("target is currently offline")
    },
    
    denktmit_blog: {
        title: "DenktMit Blog",
        human_url: "https://denktmit.de/blog/",
        icon: "/assets/icons/code.png",
        data_url: "https://denktmit.de/feed.xml",
        local_file: "denktmit-blog-feed.xml",
        rss_filter: { author: "Sven", title: Sven }, // Could apply afterwards...
        [load]: download,
    },
    
    svenk_local_blog: {
        title: "SvenK local Blog",
        human_url: "https://svenk.org/posts/",
        icon: "/assets/icons/essay.png",
        from_collection: "local_blog",
        [load]: skip_download("loaded from 11ty collection at 11ty runtime")
    },
    
    scientific_publications: {
        title: "Publications",
        human_url: "https://github.com/svenk/publications/",
        icon: "/assets/icons/univ.png",
        data_url: "https://raw.githubusercontent.com/svenk/publications/master/Papers/papers-svenk.yaml",
        local_file: "scientific_publications.yaml",
        
        [load]() {
            await assert_publications();
            await cp("publications/Papers/papers-svenk.yaml", this.local_file)
            // this.fixed_dates = parse_date_inplace(this)
        },
    },
    
    talks: {
        title: "Talks",
        human_url: "https://github.com/svenk/publications/",
        icon: "/assets/icons/talk.png",
        local_file: "talks.yaml",
        [load]() {
            await assert_publications();
            const { stdout } = await execAsync("publications/Talks/find-talks.py")
            await writeFile(local_file, stdout);
        }
    },
    
    t29_blog: {
        title: "technikum29 Blog",
        human_url: "https://technikum29.de/blog/",
        icon: "/assets/icons/museum.png",
        data_url: "https://technikum29.de/blog/rss.php",
        local_file: "t29-blog-feed.xml",
        [load]: download,
    },
    
    uniordner: {
        title: "Uniordner (historisch)",
        human_url: "https://sven.köppel.org/uni/",
        icon: "/assets/icons/talk.png",
        data_url: "http://sven.köppel.org/uni/cgi-bin/json-uniordner",
        local_file: "uniordner.json",
        [load]: skip_download("historical, source is mostly offline, links don't work, to fix."),
    },
}

//const sync2async = func => Promise.resolve().then(() => func)

// download all data in parallel.  TODO: Make it simpler, synced.
await Promise.all(Object.entries(data_sources).map(([k,v]) => v[load]())

// TODO: Stage all local files for git...

writeFile(data_dir + "data_sources.json", JSON.stringify(data_sources, null, 2));

