
import Fetch from "@11ty/eleventy-fetch"

// Cache shall be git-tracked
const remote_data_dir = "src/_data/remote/"

// for non-enumerable object members
const load = Symbol()

// idea: Have XML as suffix enlisted in 11ty as RSS loader.
//       apply filter then only afterwards.

function skip_download(reason) { this.skip_download = reason; }

function download() {
    const fetchConf = { duration: "1d", verbose: true, directory: remote_data_dir }
    const that = this;
    if(!this.data_url) throw Exception("Need data source URL");
    if(this.local_file) fetchConf.filenameFormat = () => this.local_file
    return Fetch(url, fetchConf).then(content => { that.data = content; });
}

const data_sources = {
    anabrid_news: {
        title: "Anabrid News",
        human_url: "https://anabrid.com/news/",
        icon: "/assets/icons/anabrid.png",
        data_url: "https://anabrid.com/news/feed.xml",
        local_file: "anabrid-news-feed.xml",
        [load]: skip_download("target is currently offline"),
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
            if(!isdir("publications")) {
                // git checkout or warn
            }
            cp("publications/Papers/papers-svenk.yaml", this.local_file)

            this.fixed_dates = parse_date_inplace(this)
        },
    },
    
    talks: {
        title: "Talks",
        human_url: "https://github.com/svenk/publications/",
        icon: "/assets/icons/talk.png",
        local_file: "talks.yaml",
        [load]() {
            // crawling is done right there...
            $$ ../publications/Talks/find-talks.py > $local_file
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

const sync2async = func => Promise.resolve().then(() => func)

// load all data in parallel
const loaded_data = Object.fromEntries(
    await Promise.all(Object.entries(data_sources).map(async ([k,v]) => v[load] ?
    [k,{...v,data:await sync2async(v[load])}] : [k,v])))
