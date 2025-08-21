// Configuration for 11ty (eleventy) Static Site Generator (SSG).
// This is an ESM file

//import { collectRedirects } from "#data/make_redirects";
import yaml from "js-yaml";
import { DateTime } from "luxon";

import fs from 'fs';
import path from 'path';

export default async function(eleventyConfig) {
	eleventyConfig.addPassthroughCopy("assets");
	// emulate passthrought copy during --serve usage, to make development faster
	eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
	
	eleventyConfig.addFilter("debugger", function(data) { debugger; });

	eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));
	
	// add global default layout, https://github.com/11ty/eleventy/issues/380
	eleventyConfig.addGlobalData("layout", "default.html");
	
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
