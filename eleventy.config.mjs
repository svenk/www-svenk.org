// Configuration for 11ty (eleventy) Static Site Generator (SSG).
// This is an ESM file

import { RenderPlugin } from "@11ty/eleventy";
import Fetch from "@11ty/eleventy-fetch"
import { writeFile, mkdir } from 'fs/promises'

//import { collectRedirects } from "#data/make_redirects";
import yaml from "js-yaml"
import { XMLParser } from "fast-xml-parser"
import { DateTime } from "luxon"

import fs from 'fs'
import path from 'path'

export default async function(eleventyConfig) {
	eleventyConfig.addPassthroughCopy("src/assets")
	// emulate passthrought copy during --serve usage, to make development faster
	eleventyConfig.setServerPassthroughCopyBehavior("passthrough")
	
	eleventyConfig.addFilter("debugger", function(data) { debugger; })

	const slugify = eleventyConfig.getFilter("slugify")
	
	// Usage like <link rel="stylesheet" href="{% cacheAsset "https://some-cdn/bla.css" %}">
	eleventyConfig.addShortcode("cacheAsset", async function (url) {
		const directory = "/assets/remote-cached/"
		var assetFilename = slugify(url);
		let content = await Fetch(url, {duration: "1d", type: "text", verbose: true,})

		const ext = url.split(/[#?]/)[0].split('.').pop().trim()
		const localUrl = directory + assetFilename + "." + ext
		await mkdir("_site" + directory, {recursive:true})
		await writeFile("_site" + localUrl, content)
		return localUrl
	});

	eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents))
	
	// TODO: Handle parsing failures which should not stop 11ty from continuing
	eleventyConfig.addDataExtension("xml", (xml) => new XMLParser({
		removeNSPrefix: true,
		// htmlEntities: true,
	}).parse(xml))
	
	// add global default layout, https://github.com/11ty/eleventy/issues/380
	eleventyConfig.addGlobalData("layout", "default.html")
	
	// in liquid, just use filter | date: "%Y-%m-%d". Nunjucks needs however this:
	eleventyConfig.addFilter("dateFormat", (value, format="yyyy-LL-dd", zone="utc") => {
		let dt =
			value instanceof Date ? DateTime.fromJSDate(value, { zone }) :
			typeof value === 'number' ? DateTime.fromMillis(value, { zone }) :
			typeof value === 'string' ? DateTime.fromISO(value, { zone }) :
			null
		return dt && dt.isValid ? dt.toFormat(format) : "";
	});
	
	eleventyConfig.addShortcode("prettyDump", function(data){
		const esc=s=>String(s).replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]))
		const url=/\bhttps?:\/\/[^\s<]+/g
		const link=s=>String(s).replace(url,u=>`<a href="${esc(u)}">${esc(u)}</a>`)
		const render=o=>`<dl>${Object.entries(o||{}).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${
			v==null?"":Array.isArray(v)?(v.every(x=>typeof x==="string")?v.map(link).join(", "):v.map(x=>typeof x==="object"?render(x):link(x)).join(", ")):(
			typeof v==="object"?render(v):link(v))
		}</dd>`).join("")}</dl>`
		return render(data)
	})
	
	eleventyConfig.addPlugin(RenderPlugin);
	
    return {
        markdownTemplateEngine: 'liquid',
        htmlTemplateEngine: 'liquid',// 'njk',
        dir: {
            input: 'src'
        },
		templateFormats: ["htm","html","md","njk","liquid","11ty.js"],
    }
};
