import fs from 'node:fs';

const isRelease = (v) => /^\d+\.\d+(\.\d+)?$/.test(v);

// loads mods to each be seperate rows per each version of a mod
export function loadMods(file = 'data/mods.jsonl') {
    const mods = [];
    const entries = [];

    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        const mod = JSON.parse(line);
        const modIndex = mods.length;
        mods.push(mod);

        const loaders = mod.loaders.length ? mod.loaders : ['unknown'];
        for (const version of mod.versions.filter(isRelease)) {
            for (const loader of loaders) {
                entries.push({ version, loader, title: mod.title, modIndex });
            }
        }
    }
    return { mods, entries };
}