import { compareVersions } from "./compareModVersion.js";

/* STRUCTURE:
    key is { version, downloads, modIndex }
    order is version (numeric), then downloads (HIGHEST first), then modIndex
*/
export function compareKeys(a, b) {
    const v = compareVersions(a.version, b.version);
    if (v !== 0) return v;

    if (a.downloads !== b.downloads) return b.downloads - a.downloads;

    return a.modIndex - b.modIndex;
}

/*
    Fake key that sorts before every real key of this version.
    downloads: Infinity comes before any real download count
    modIndex: -1 means it can't match a real mod (real indexes start at 0)
*/
export function startOfVersion(version) {
    return { version, downloads: Infinity, modIndex: -1 }; 
}

/* B+ TREE NODE CLASSES */
class LeafNode {
    constructor() {
        this.isLeaf = true;
        this.keys = []; 
        this.values = []; // values[i] correspond to keys[i]
        this.next = null; // right leaf
    }
}

class InternalNode {
    constructor() {
        this.isLeaf = false;
        this.keys = [];      // separator keys: guide the search to the right child (no data here)
        this.children = [];  // child nodes; always keys.length + 1 of them
    }
}



