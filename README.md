# Personal Website https://svenk.org as static Jekyll site

This repository hosts the primary code for my personal website
https://svenk.org. It used to be static HTML and now works using
Jekyll 3 instead.

## How to setup, run/build/serve

Since we don't have a `Gemfile` in the repo, don't use `bundle`.
Instead, install jekyll system-wide, with your package manager or 
`gem install jekyll`. Sole dependency is `jekyll-feed`, which also
needs to be installed. You probably have to make sure the gem directory
is part of your `$PATH`.

Usage is then `jekyll serve -l` to get a development server spin up.

## Hosting

The primary repository is located at https://github.com/svenk/www-svenk.org

The website is hosted at https://svenk.org. This server is driven
by `kolja.ufopixel.de`, ie. a VPS. The directory holding the static
files also holds a large number of files not part of the repository.

**Uploading** currently happens with **manual** sync using the `./upload.sh`.

