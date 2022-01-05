#!/usr/bin/env python3

import argparse, yaml, lxml.etree as et

parser = argparse.ArgumentParser()
parser.add_argument("xml_filename", type=argparse.FileType('r'))
parser.add_argument("--author-filter", default="",
    help="Author name to filter on (case insensitive)")
parser.add_argument("--skip-field", nargs="*",
    default=[], help="Fields to skip in output (ie: description)")
args = parser.parse_args()

xml = et.parse(args.xml_filename)
items = xml.findall("//item")
records = [ { e.tag: e.text for e in item \
               if not e.tag in args.skip_field
            } for item in items ]

if args.author_filter:
    records = list(filter(lambda rec: "author" in rec and 
        args.author_filter.lower() in  rec["author"].lower(),
        records))

print(yaml.dump(records))
