/* 
ONE TIME SCRIPT that goes/pages through Modrinth search (only mods) returning one JSON line per mod into data/mods.jsonl

RUN: node scripts/build-mod-index.mjs
TEST: MAX_PAGES=3 node scripts/build-mod-index.mjs
*/

import fs from 'node:fs';
import path from 'node:path';

// holds API address use left side unless its empty then use the actual raw link
const BASE_URL = process.env.BASE_URL || 'https://api.modrinth.com';

// id string that accompanies (is sent with) each request
const USER_AGENT = 'natgiselle/modpunch/0.1';

// maximum mods to request per call at once (the api limit = 100 data entries (mods) per page)
const PAGE_SIZE = 100;

// directory (folder) in which output is placed into
const OUT_DIR = process.env.OUT_DIR  || 'data';

// full path to main output file in output directory 'data/mods.jsonl'
const OUT_FILE = path.join(OUT_DIR, 'mods.jsonl');

// path to data progres.json scriptsaves current offset after every page with this resuming after any crauh
const PROGRESS_FILE = path.join(OUT_DIR, 'progress.json');

// limits th amount ofg page one run can fetch
const MAX_PAGES = Number(process.env.MAX_PAGES || Infinity);

// creates gap between requests to have time for processing them
const DELAY_MS = 250; 

/* LOADERS + TAGS CATEGORIES */
let LOADERS = new Set(
    [
        'fabric',
        'forge',
        'neoforge',
        'quilt',
        'babric',
        'bta-babric',
        'legacy-fabric',
        'liteloader',
        'modloader',
        'nilloader',
        'ornithe',
        'rift'
    ]
);


// holds what .test(v) returns using regular expressions to identify whether the input examined is a proper minecraft version release (used to identify compatibility later on)
const isRelease = (v) => /^\d+\.\d+(\.\d+)?$/.test(v);

// creates a promise that finishes after a delay (only hapens where you call it with await)
const sleep = (ms) => new Promise((r) => setTimeout(r,ms));

// getJson(url) fetches one url and returns parsed JSON
async function getJson(url) {
    for (let attempt = 1; attempt <= 6; attempt++) {
        try {
            const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
            if (res.status === 429) {
                const wait = Number(res.headers.get('retry-after') || res.headers.get('x-ratelimit-reset') || 30);
                console.warn(`429 rate limited. Waiting ${wait}s...`);
                await sleep(wait * 1000 + 500);
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        }
        catch (err) {
            console.warn(`Attempt ${attempt} failed: ${err.message}`);
            await sleep(2000 * attempt);
        }
    }
    throw new Error(`Giving up on ${url}`);
}

fs.mkdirSync(OUT_DIR, { recursive: true });


// Resume support: load IDs already saved and the next offset (rerun continues where it stopped)
const seen = new Set();
if (fs.existsSync(OUT_FILE)) {
    for (const line of fs.readFileSync(OUT_FILE, 'utf8').split('\n')) {
        if (line.trim()) seen.add(JSON.parse(line).project_id);
    }
}

let offset = 0;
if (fs.existsSync(PROGRESS_FILE)) offset = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')).offset || 0;
console.log(`Starting at offset ${offset}, ${seen.size} mods already saved.`);

const out = fs.createWriteStream(OUT_FILE, { flags: 'a' });
let total = Infinity;
let pages = 0;

// main loop that pages through all of Modrinth's mods so it fetches one page of mod results saving each new mod to the file recording its progress until it runs out of pages
while (offset < total && pages < MAX_PAGES) {
    const params = new URLSearchParams({
        facets: JSON.stringify([['project_type:mod']]),
        limit: String(PAGE_SIZE),
        offset: String(offset),

        // provides stable order in paging
        index: 'downloads', 
    });
    const data = await getJson(`${BASE_URL}/v2/search?${params}`);
    total = data.total_hits;
    if (!data.hits.length) break;

    for (const h of data.hits) {
        // results may shift while paging
        if (seen.has(h.project_id)) continue; 
        seen.add(h.project_id);
        const cats = h.categories || [];
        out.write(JSON.stringify({
        project_id: h.project_id,
        slug: h.slug,
        title: h.title,
        description: h.description,
        loaders: cats.filter((c) => LOADERS.has(c)),
        tags: cats.filter((c) => !LOADERS.has(c)),
        versions: h.versions || [],
        client_side: h.client_side,
        server_side: h.server_side,
        downloads: h.downloads,
        date_modified: h.date_modified,
        latest_version: h.latest_version,
        }) + '\n');
    }

    offset += PAGE_SIZE;
    pages++;
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ offset, total }));
    if (pages % 10 === 0) console.log(`offset ${offset}/${total}, ${seen.size} unique mods`);
    await sleep(DELAY_MS);
}


await new Promise((r) => out.end(r));

// count rows where one row is one mod with one Minecraft version
let mods = 0, allRows = 0, releaseRows = 0;
for (const line of fs.readFileSync(OUT_FILE, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const m = JSON.parse(line);
    mods++;
    allRows += m.versions.length;
    releaseRows += m.versions.filter(isRelease).length;
}
console.log(`\nDone with this run. Mods: ${mods}`);
console.log(`Rows (mod x MC version), all versions:  ${allRows}`);
console.log(`Rows (mod x MC version), releases only: ${releaseRows}`);
console.log(`File size: ${(fs.statSync(OUT_FILE).size / 1e6).toFixed(1)} MB`);