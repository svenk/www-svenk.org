# Personal Website https://svenk.org as static Jekyll site

This repository hosts the primary code for my personal website
https://svenk.org. It used to be static HTML and now works using
Jekyll 3 instead.

## How to setup, run/build/serve

Basically use one of these commands:

  bundle install
  bundle add webrick
  bundle exec jekyll build --watch
  bundle exec jekyll serve -l

## Hosting

The primary repository is located at https://github.com/svenk/www-svenk.org

The website is hosted at https://svenk.org. This server is driven
by `kolja.ufopixel.de`, ie. a VPS. The directory holding the static
files also holds a large number of files not part of the repository.

Uploading currently happens with manual sync.

