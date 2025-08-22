// Configuration for 11ty (eleventy) Static Site Generator (SSG).
// This is an ESM file

import Fetch from "@11ty/eleventy-fetch"
import { writeFile, mkdir } from 'fs/promises'

//import { collectRedirects } from "#data/make_redirects";
import yaml from "js-yaml"
import { DateTime } from "luxon"

import fs from 'fs'
import path from 'path'

export default async function(eleventyConfig) {
	eleventyConfig.addPassthroughCopy("assets")
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
	
	// add global default layout, https://github.com/11ty/eleventy/issues/380
	eleventyConfig.addGlobalData("layout", "default.html")
	
	//eleventyConfig.addFilter("formatDay", dateObj => {
	//	return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat("yyyy-LL-dd");
	//});
	
    return {
        markdownTemplateEngine: 'liquid',
        htmlTemplateEngine: 'liquid',// 'njk',
        dir: {
            input: 'src'
        },
		templateFormats: ["htm","html","md","njk","liquid"],
    }
};
