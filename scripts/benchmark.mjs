import { BPlusTree, startOfVersion, compareKeys } from "../src/data_structures/BPlusTree.js";
import { compareVersions } from "../src/data_structures/compareModVersion.js";
import { loadMods } from "./load-mods.mjs";

const { mods, entries } = loadMods();
const keys = entries.map((e) => ({
    version: e.version,
    downloads: mods[e.modIndex].downloads,
    modIndex: e.modIndex,
}));

// function runs once and prints how long it took returning the result
function time(label, fn) {
    const start = performance.now();
    const result = fn();
    const ms = performance.now() - start;
    console.log(label.padEnd(36), ms.toFixed(1).padStart(10), "ms");
    return result;
}

const isOptimization = (i) => mods[i].tags.includes("optimization");

/* BUILD */
console.log("\nBUILD");
const tree = time("B+ tree (maxKeys 64)", () => {
    const t = new BPlusTree(64);
    for (const k of keys) t.insertNode(k, k.modIndex);
    return t;
});

const byVersion = time("Map: version -> sorted list", () => {
    const m = new Map();
    for (const k of keys) {
        if (!m.has(k.version)) m.set(k.version, []);
        m.get(k.version).push(k);
    }
    for (const list of m.values()) list.sort(compareKeys);
    return m;
});

const exactMap = time("Map: exact key", () => {
    const m = new Map();
    for (const k of keys) m.set(`${k.version}|${k.modIndex}`, k.modIndex);
    return m;
});

/* QUERY 1: top 20 optimization mods for a version */
const versions = ["1.21.1", "1.20.1", "1.19.2", "1.16.5", "1.12.2"];
const RUNS = 200; // 200 x 5 versions = 1000 queries

console.log("\nTOP 20 FOR A VERSION (1000 queries)");
time("array scan + sort", () => {
    for (let r = 0; r < RUNS; r++) {
        for (const v of versions) {
            keys.filter((k) => k.version === v && isOptimization(k.modIndex))
                .sort(compareKeys)
                .slice(0, 20);
        }
    }
});

time("Map", () => {
    for (let r = 0; r < RUNS; r++) {
        for (const v of versions) {
            const out = [];
            for (const k of byVersion.get(v) || []) {
                if (isOptimization(k.modIndex)) {
                    out.push(k.modIndex);
                    if (out.length === 20) break;
                }
            }
        }
    }
});

time("B+ tree rangeScan", () => {
    for (let r = 0; r < RUNS; r++) {
        for (const v of versions) {
            tree.rangeScan(startOfVersion(v), {
                stopWhen: (k) => k.version !== v,
                filter: (k, i) => isOptimization(i),
                limit: 20,
            });
        }
    }
});


/* QUERY 2: looking up the exact key being searched for */
const sample = [];
for (let i = 0; i < 10000; i++) sample.push(keys[(i * 7919) % keys.length]);

console.log("\nEXACT LOOKUP");
time("array find (200 lookups only)", () => {
    for (const s of sample.slice(0, 200)) keys.find((k) => compareKeys(k, s) === 0);
});
time("Map (10000 lookups)", () => {
    for (const s of sample) exactMap.get(`${s.version}|${s.modIndex}`);
});
time("B+ tree search (10000 lookups)", () => {
    for (const s of sample) tree.search(s);
});


/* QUERY 3: version range for example all of 1.20.x */
const lo = "1.20";
const hi = "1.21";

console.log("\nRANGE: every mod for 1.20 up to (not including) 1.21");
time("array scan", () =>
    keys.filter((k) => compareVersions(k.version, lo) >= 0 && compareVersions(k.version, hi) < 0)
);
time("Map (check every version key)", () => {
    const out = [];
    for (const [v, list] of byVersion) {
        if (compareVersions(v, lo) >= 0 && compareVersions(v, hi) < 0) {
            for (const k of list) out.push(k.modIndex);
        }
    }
    return out;
});
time("B+ tree rangeScan", () =>
    tree.rangeScan(startOfVersion(lo), { stopWhen: (k) => compareVersions(k.version, hi) >= 0 })
);