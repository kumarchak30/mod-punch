import fs from 'node:fs';

const isRelease = (v) => /^\d+\.\d+(\.\d+)?$/.test(v);

// loads mods to each be separate rows per each version of a mod
export function loadMods(file = 'data/mods.jsonl') {
    const mods = [];
    const entries = [];

    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        const mod = JSON.parse(line);
        const modIndex = mods.length;
        mods.push(mod);

        for (const version of mod.versions.filter(isRelease)) {
            entries.push({ version, title: mod.title, modIndex });
        }
    }
    return { mods, entries };
}