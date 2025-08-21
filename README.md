# Personal Website https://svenk.org with 11ty Static Site Generator

This repository hosts the primary code for my personal website
https://svenk.org. It used to be static HTML and now works using
~~Jekyll 3~~ [11ty](https://www.11ty.dev/) instead.

## How to setup, run/build/serve

```
git clone ... && cd <repo>
npm install
npx @11ty/eleventy --serve
```

## Hosting

The primary repository is located at https://github.com/svenk/www-svenk.org

The website is hosted at https://svenk.org. This server is driven
by `kolja.ufopixel.de`, ie. a VPS. The directory holding the static
files also holds a large number of files not part of the repository.

**Uploading** currently happens with **manual** sync using the `./upload.sh`.

