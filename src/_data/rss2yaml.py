#!/usr/bin/env python3

import argparse, yaml, lxml.etree as et

parser = argparse.ArgumentParser()
parser.add_argument("xml_filename", type=argparse.FileType('r'))
parser.add_argument("--author-filter", default="",
    help="Author name to filter on (case insensitive)")
parser.add_argument("--title-filter", default="",
    help="Title to filter on (case insensitive), is OR-added to author-filter")
parser.add_argument("--skip-field", nargs="*",
    default=[], help="Fields to skip in output (ie: description)")
parser.add_argument("--out-keyname", default=None,
    help="Whether to output YAML dict with given key")
args = parser.parse_args()

parser = et.XMLParser(resolve_entities=False) # for also slurping not-so-well-formed XMLs
xml = et.parse(args.xml_filename, parser)
items = xml.findall(".//item")
records = [ { e.tag: e.text for e in item \
               if not e.tag in args.skip_field
            } for item in items ]
unfiltered_records = records

if args.author_filter:
    records = list(filter(lambda rec: "author" in rec and 
        args.author_filter.lower() in  rec["author"].lower(),
        unfiltered_records))

if args.title_filter:
    # hoping that we don't duplicate stuff...
    records += list(filter(lambda rec: "title" in rec and 
        args.title_filter.lower() in  rec["title"].lower(),
        unfiltered_records))
    
out_obj = {args.out_keyname: records} if args.out_keyname else records
print(yaml.dump(out_obj))
