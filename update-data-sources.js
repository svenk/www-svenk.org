// run this script with: npm run update-data-sources
// Otherwise paths might not be correct.

import { readdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sourcesDir = join(__dirname, "src/sources");
export const dataDir = join(__dirname, "src/_data")

const download = (source, target) => fetch(source).then(res => res.arrayBuffer())
            .then(buf => writeFile(target, Buffer.from(buf)))
            .catch(console.error)

export const sources = await Promise.all(
  (await readdir(sourcesDir))
    .filter(f => f.endsWith(".11ty.js"))
    .map(f => import(join(sourcesDir, f)).then(m => m.source.meta)
    .then(meta => {
        if(meta.skipped_download || meta.skip_download) {
            console.info(`Skipping ${meta.id}`)
            return
        }

        if((!meta.data_url && !meta.download) || !meta.local_file) {
            console.log("Cannot download, missing information.", meta)
            //throw new Error(`Cannot download ${meta}, missing information`)
            return
        }
        console.log(`Downloading ${meta.id}...`)
        return (meta.download ? meta.download() : download(meta.data_url, join(dataDir, meta.local_file)))
            .then(res => meta.local_file && exec(`git add ${dataDir}/${meta.local_file}`))
    })
  )
);



