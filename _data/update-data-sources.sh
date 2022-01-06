#!/bin/bash

set -e
data_sources_fname="data_sources.yml"
log() { echo "$@" | tee -a $data_sources_fname; }
# bash magic DSL for quickly generating YAMLs: Start dict, show key in list.
# note the indents (number of whitespaces) which are important...
start() { log "  $1:"; }
prop()  { log "    $@"; }
show()  { prop "$1: "${!1}; }
download() { curl -sS $data_url > $local_file; }
git_add_assets() { git add ${local_file/.*}.*; }

echo "data_sources:" | tee $data_sources_fname # wipes content
declare -a local_yaml_files=()

identifier="denktmit-blog"; start $identifier
prop "title: DenktMit Blog"
prop "human_url: https://denktmit.de/outreach.html"
prop "icon: /assets/icons/code.png"
data_url="https://denktmit.de/blog-feed.xml"; show data_url
local_file="denktmit-blog-feed.xml"; show local_file
download
./rss2yaml.py $local_file --author-filter=Sven --skip-field=description \
    --out-keyname=$identifier  > ${local_file/.*}.yaml
local_yaml_files+=("${local_file/.*}.yaml")
git_add_assets

identifier="scientific_publications"; start $identifier
prop "title: Publications"
prop "human_url: https://github.com/svenk/publications/"
prop "icon: /assets/icons/univ.png"
data_url="https://raw.githubusercontent.com/svenk/publications/master/Papers/papers-svenk.yaml"
show data_url
local_file="$identifier.yaml"; show local_file
# either use some local source:
cp ../publications/Papers/papers-svenk.yaml $local_file
# or:
#download
#sed -i "s/scientific_publications:/$identifier:/" $local_file # should probably assert
local_yaml_files+=($local_file)
git_add_assets

identifier="talks"; start $identifier
prop "title: Talks"
prop "human_url: https://github.com/svenk/publications/"
prop "icon: /assets/icons/talk.png"
local_file="$identifier.yaml"; show local_file
# there is no data url and download, crawling is done right here in place.
../publications/Talks/find-talks.py > $local_file
# should probably assert: "talks:" is in $local_file.
local_yaml_files+=($local_file)
git_add_assets

identifier="t29-blog"; start $identifier
prop "title: technikum29 Blog"
prop "human_url: https://technikum29.de/blog/"
prop "icon: /assets/icons/museum.png"
data_url="https://technikum29.de/blog/rss.php"; show data_url
local_file="t29-blog-feed.xml"; show local_file
download
./rss2yaml.py $local_file --out-keyname=$identifier > ${local_file/.*}.yaml
local_yaml_files+=("${local_file/.*}.yaml")
git_add_assets

identifier="uniordner"; start $identifier
prop "title: Uniordner (historisch)"
prop "human_url: http://sven.köppel.org/uni/"
prop "icon: /assets/icons/talk.png" # <- because it is mostly talks
data_url="http://sven.köppel.org/uni/cgi-bin/json-uniordner"; show data_url
local_file="uniordner.json"; show local_file
download
python -c "import yaml,json; print(yaml.dump(json.load(open('$local_file'))))" \
    > ${local_file/.*}.yaml
local_yaml_files+=("${local_file/.*}.yaml")
git_add_assets

./aggregate.py "${local_yaml_files[@]}" \
    --out-keyname="aggregated_posts" > aggregated_posts.yaml
git add aggregated_posts.yaml
