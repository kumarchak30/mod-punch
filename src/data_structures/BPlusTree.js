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





export class BPlusTree {
    // B+ tree with 4 nodes max
    constructor(maxKeys = 4, compare = compareKeys) {
        this.maxKeys = maxKeys;
        this.compare = compare;
        this.root = new LeafNode();
        this.size = 0;
    }


    // binary search lower bound for 1st index i when keys[i] >= key
    lowerBound(keys, key) {
        let l = 0;
        let r = keys.length;
        while (l < r) {
            const mid = Math.floor((l + r) / 2);
            if (this.compare(keys[mid], key) < 0) l = mid + 1;
            else r = mid;
        }
        return l;
    }
}