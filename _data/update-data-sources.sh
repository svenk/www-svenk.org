#!/bin/bash

set -e
data_sources_fname="data_sources.yml"
log() { echo "$@" | tee -a $data_sources_fname; }
show() { log "    $1: "${!1}; }
download() { curl -sS $data_url > $local_file; }
git_add_assets() { git add ${local_file/.*}.*; }

echo "data_sources:" | tee $data_sources_fname # wipes content

log "  - title: DenktMit Blog"
log "    human_url: https://denktmit.de/outreach.html"
data_url="https://denktmit.de/blog-feed.xml"; show data_url
local_file="denktmit-blog-feed.xml"; show local_file
download
field_name="denktmit-blog-feed"; show field_name
#echo $field_name > ${local_file/.*}.yaml
./rss2yaml.py $local_file --author-filter=Sven --skip-field=description \
    > ${local_file/.*}.yaml
git_add_assets

log "  - title: Publications"
log "    human_url: https://github.com/svenk/publications/"
log "    field_name: papers"
data_url="https://raw.githubusercontent.com/svenk/publications/master/Papers/papers-svenk.yaml"
show data_url
local_file="$(basename $data_url)"; show local_file
download
# could assert: head -n1 $local_file == "$field_name:"
git_add_assets
