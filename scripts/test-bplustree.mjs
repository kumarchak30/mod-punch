import { BPlusTree, startOfVersion } from "./src/data_structures/BPlusTree.js";
import { loadMods } from "./scripts/loadMods.mjs";

// checking with small tree
const small = new BPlusTree(4);
for (let n = 0; n < 12; n++) {
    small.insert({ version: "1.21.1", downloads: 100 - n * 5, modIndex: n }, n);
}
small.print((k) => k.downloads);

// for full data testing
console.time("load");
const { mods, entries } = loadMods();
console.timeEnd("load");

console.time("build");
const tree = new BPlusTree(64);
for (const e of entries) {
    tree.insert(
        { version: e.version, downloads: mods[e.modIndex].downloads, modIndex: e.modIndex },
        e.modIndex
    );
}
console.timeEnd("build");
console.log("size", tree.size); 

const version = "1.21.1";
const top = tree.rangeScan(startOfVersion(version), {
    stopWhen: (k) => k.version !== version,
    filter: (k, modIndex) => mods[modIndex].tags.includes("optimization"),
    limit: 5,
});
console.log(top.map((i) => mods[i].title));