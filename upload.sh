#!/bin/bash
set -e
npx @11ty/eleventy
cd _site
rm -f README.md upload.sh # cleanup
rsync -vr . svenk.org:~/www/svenk.org/
