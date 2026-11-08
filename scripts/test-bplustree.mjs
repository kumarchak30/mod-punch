import { BPlusTree, startOfVersion } from "../src/data_structures/BPlusTree.js";
import { loadMods } from "./load-mods.mjs";

// checking with small tree
const small = new BPlusTree(4);
for (let n = 0; n < 12; n++) {
    small.insertNode({ version: "1.21.1", downloads: 100 - n * 5, modIndex: n }, n);
}
small.print((k) => k.downloads);

// for full data testing
console.time("load");
const { mods, entries } = loadMods();
console.timeEnd("load");

console.time("build");
const tree = new BPlusTree(64);
for (const e of entries) {
    tree.insertNode(
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

/* EXTRA TESTS */
const k = { version: "1.21.1", downloads: 100, modIndex: 0 };
console.log(small.search(k));  // 0
console.log(small.deleteNode(k));  // true
console.log(small.search(k));  // undefined
console.log(small.deleteNode(k));  // false gone
console.log(small.size);       // 11
small.print((k) => k.downloads); // 100 is gone from the leaf