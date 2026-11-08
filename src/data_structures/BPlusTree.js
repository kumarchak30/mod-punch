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

export function startOfVersion(version) {
    return { version, downloads: Infinity, modIndex: -1 }; // set modIndex default to -1 to demonstrate it does not already have an identified position
}
class LeafNode {
    constructor() {
        this.isLeaf = true;
        this.keys = []; // values[i] correspond to keys[i]
        this.next = null; // right leaf
    }
}