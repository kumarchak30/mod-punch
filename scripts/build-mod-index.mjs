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



