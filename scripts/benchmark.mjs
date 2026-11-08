import { BPlusTree, startOfVersion, compareKeys } from "../src/data_structures/bPlusTree.js";
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