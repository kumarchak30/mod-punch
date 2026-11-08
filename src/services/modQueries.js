import { BPlusTree, startOfVersion } from "../data_structures/BPlusTree.js"
import { compareVersions } from "../data_structures/compareModVersion.js"

let mods = []
let tree = null
let versions = []
let loading = null

async function buildIndex() {
    const res = await fetch("/mods-lite.json")
    if (!res.ok) throw new Error(`Could not load mods (${res.status})`)
    mods = await res.json()

    tree = new BPlusTree(64)
    const versionSet = new Set()

    mods.forEach((mod, modIndex) => {
        for (const version of mod.versions) {
            tree.insertNode({ version, downloads: mod.downloads, modIndex }, modIndex)
            versionSet.add(version)
        }
    })

    versions = [...versionSet].sort((a, b) => compareVersions(b, a)) // puts newest first
}


// only builds once regardless of how many times it gets called
export function loadModIndex() {
    if (!loading) loading = buildIndex()
    return loading
}

export function getAllVersions() {
    return versions
}

/* 
    GET MODS FOR VERSION:
    scans the tree for one version (already sorted by downloads),
    keeps mods in the chosen category, and returns one page of results plus the total count
*/ 
export function getModsForVersion(version, { category = "All", offset = 0, limit = 20 } = {}) {
    if (!tree) return { results: [], total: 0 } // tree not built yet (or reset by hot reload)

    const tag = category.toLowerCase().replaceAll(" ", "-")
    const options = {
        stopWhen: (key) => key.version !== version,
        filter: category === "All" ? undefined : (key, modIndex) => mods[modIndex].tags.includes(tag),
    }

    const results = tree
        .rangeScan(startOfVersion(version), { ...options, offset, limit })
        .map((modIndex) => mods[modIndex])

    const total = tree.rangeScan(startOfVersion(version), options).length

    return { results, total }
}