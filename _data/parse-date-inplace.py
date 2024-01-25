#!/usr/bin/env python

# This is an ugly attempt to replace occurances of "Jun 2023" with "2023-06-25"

from dateutil.parser import parse # pip install ...
import yaml # pip install ...
from pathlib import Path # python included
import sys, os 

#def die(reason): print(reason, file=sys.stderr); sys.exit(-1)
#get = lambda name: os.environ[name] if name in os.environ else die(f"Need ENV var {name}")

fn = Path("scientific_publications.yaml")

data = yaml.load(fn.read_text(), Loader=yaml.CLoader)

collection = data["scientific_publications"]

for item in collection:
    item["date_machine_readable"] = parse(item["date"]).strftime("%Y-%m-%d")

with open(fn, "r") as ifh:
    data = yaml.load(ifh, Loader=yaml.CLoader)
    
fn.write_text(yaml.dump(data))
