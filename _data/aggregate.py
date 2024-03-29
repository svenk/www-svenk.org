#!/usr/bin/env python3

import argparse, yaml, pathlib
from dateutil.parser import parse as parse_date # sloppy date parser
stem = lambda path: pathlib.Path(path).stem

parser = argparse.ArgumentParser()
parser.add_argument("yaml_filenames", nargs="+", type=argparse.FileType('r'))
parser.add_argument("--out-keyname", default=None, help="Whether to output YAML dict with given key")
args = parser.parse_args()

def prepend(key, prepender):
    def lookup(dct):
        if key in dct:
            return prepender + str(dct[key])
        else:
            return None
    return lookup

def uniordner():
    def lookup(dct):
        # Detect a uniordner-like entry and make something nice of it
        if "event" in dct and "title" in dct:
            return f"%(title)s (%(event)s)"%dct
        else:
            return None
    return lookup

def linklist(key):
    # as seen in publications.yaml
    def lookup(dct):
        if key in dct and isinstance(dct[key], list) and len(dct[key])>0:
            return dct[key][0]
        else:
            return None
    return lookup

candidates = {
    "title": [ "title", uniordner() ],
    "date":  [ "date", "pubDate" ],
    "link":  [ "video", "sources", "slides",
               "link", prepend("DOI", "https://dx.doi.org/"),
                prepend("arxiv", "https://arxiv.org/abs/"),
                linklist("links") ]
}

records = []
for fh in args.yaml_filenames:
    identifier = stem(fh.name)
    data = yaml.load(fh, Loader=yaml.CLoader)
    if isinstance(data, dict):
        keys = list(data.keys())
        if len(keys) != 1:
            print(f"{identifier}: Contains dictionary with keys {keys}. Need a single key or list!")
            continue
        identifier = keys[0]
        data = data[identifier]
    assert isinstance(data, list)
    for irec in data:
        assert isinstance(irec, dict)
        orec = { 'origin': identifier }
        
        # general mapping attempt
        for field, lookup_candidates in candidates.items():
            for candidate in lookup_candidates:
                if callable(candidate) and candidate(irec):
                    orec[field] = candidate(irec)
                if candidate in irec:
                    orec[field] = irec[candidate]
        
        # try to parse date to something low fidelity
        if "date" in orec:
            orec["date"] = parse_date(str(orec["date"])).strftime("%Y-%m-%d")
                    
        records.append(orec)

# sort by date


out_obj = {args.out_keyname: records} if args.out_keyname else records
print(yaml.dump(out_obj))
    
