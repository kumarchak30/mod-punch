import fs from "node:fs"
import { loadMods } from "./load-mods.mjs"

const KEEP = 5000 // keeps most downloaded mods (lift or drop to change file size)
const OUT = "public/mods-lite.json"
const isRelease = (v) => /^\d+\.\d+(\.\d+)?$/.test(v)

const { mods } = loadMods()

const top = [...mods]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, KEEP)


// handles the required/necessary fields the minecraft mod cards need
const lite = top.map((mod) => ({
    project_id: mod.project_id,
    slug: mod.slug,
    title: mod.title,
    description: (mod.description ?? "").slice(0, 200),
    downloads: mod.downloads,
    tags: mod.tags,
    loaders: mod.loaders,
    versions: mod.versions.filter(isRelease),
}))

fs.writeFileSync(OUT, JSON.stringify(lite))
const mb = fs.statSync(OUT).size / 1e6
console.log(`wrote ${lite.length} mods to ${OUT} (${mb.toFixed(1)} MB)`)