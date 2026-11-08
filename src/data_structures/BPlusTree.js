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