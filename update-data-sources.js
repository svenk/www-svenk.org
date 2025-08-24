import { readdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sourcesDir = join(__dirname, "src/sources");
const dataDir = join(__dirname, "src/_data")

export const sources = await Promise.all(
  (await readdir(sourcesDir))
    .filter(f => f.endsWith(".11ty.js"))
    .map(f => import(join(sourcesDir, f)).then(m => m.source.meta)
    .then(meta => {
        if(meta.skipped_download || meta.skip_download) {
            console.info(`Skipping ${meta.id}`)
            return
        }
        if(!meta.data_url || !meta.local_file) {
            console.log(meta)
            //throw new Error(`Cannot download ${meta}, missing information`)
            return
        }
        console.log(`Downloading ${meta.id}...`)
        return fetch(meta.data_url)
            .then(res => res.arrayBuffer())
            .then(buf => writeFile(join(dataDir, meta.local_file), Buffer.from(buf)))
            .catch(console.error);
            // TODO: After writeFile, call git add.
        })
     )
);



