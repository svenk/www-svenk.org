#!/bin/bash
set -e
jekyll build
cd _site
rm -f upload.sh # we don't need ourself ;-)
rsync -vr . svenk.org:~/www/svenk.org/
