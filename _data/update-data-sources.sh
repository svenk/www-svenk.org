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
prop "icon: https://denktmit.de/files/sdm/images/logo_blue_without_text.png"
data_url="https://denktmit.de/blog-feed.xml"; show data_url
local_file="denktmit-blog-feed.xml"; show local_file
download
./rss2yaml.py $local_file --author-filter=Sven --skip-field=description \
    --out-keyname=$identifier  > ${local_file/.*}.yaml
local_yaml_files+=("${local_file/.*}.yaml")
git_add_assets

identifier="papers"; start $identifier
prop "title: Publications"
prop "human_url: https://github.com/svenk/publications/"
prop "icon: https://upload.wikimedia.org/wikipedia/commons/3/32/OOjs_UI_icon_academic.svg"
data_url="https://raw.githubusercontent.com/svenk/publications/master/Papers/papers-svenk.yaml"
show data_url
local_file="$(basename $data_url)"; show local_file
download
sed -i "s/papers:/$identifier:/" $local_file # should also assert
local_yaml_files+=($local_file)
git_add_assets

identifier="t29-blog"; start $identifier
prop "title: technikum29 Blog"
prop "human_url: https://technikum29.de/blog/"
prop "icon: https://technikum29.de/shared/img-v6/touch-icon.png"
data_url="https://technikum29.de/blog/rss.php"; show data_url
local_file="t29-blog-feed.xml"; show local_file
download
./rss2yaml.py $local_file --out-keyname=$identifier > ${local_file/.*}.yaml
local_yaml_files+=("${local_file/.*}.yaml")
git_add_assets

identifier="uniordner"; start $identifier
prop "title: Uniordner (historisch)"
prop "human_url: http://sven.köppel.org/uni/"
prop "icon: http://sven.köppel.org/favicon.ico"
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
