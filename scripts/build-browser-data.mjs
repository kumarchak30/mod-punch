import fs from "node:fs"
import { loadMods } from "./load-mods.mjs"

const KEEP = 5000 // keeps most downloaded mods (lift or drop to change file size)
const OUT = "public/mods-lite.json"
const isRelease = (v) => /^\d+\.\d+(\.\d+)?$/.test(v)

const { mods } = loadMods()

const top = [...mods]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, KEEP)