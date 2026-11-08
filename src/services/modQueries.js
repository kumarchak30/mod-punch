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