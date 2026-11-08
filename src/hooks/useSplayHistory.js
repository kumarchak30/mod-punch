import { useCallback, useState } from "react";
import { SplayTree } from "../data_structures/SplayTree.js";

/*
    Keeps one SplayTree per (user, list) and saves it to localStorage.
    storageKey example: "modpunch:<userId>:searches"

    TODO: swap localStorage for a Supabase table so history follows the user across devices.
*/
function load(storageKey) {
    try {
        const raw = localStorage.getItem(storageKey);
        return SplayTree.fromJSON(raw ? JSON.parse(raw) : []);
    } catch {
        return new SplayTree();
    }
}

function save(storageKey, tree) {
    try {
        localStorage.setItem(storageKey, JSON.stringify(tree));
    } catch {
        // storage full / blocked: history just won't persist this time
    }
}

export function useSplayHistory(storageKey, { limit = 10, order = "recent" } = {}) {
    const [state, setState] = useState(() => ({ key: storageKey, tree: load(storageKey) }));
    const [version, setVersion] = useState(0); // bump to re-render after the tree mutates

    // reload when the user (and so the key) changes
    if (state.key !== storageKey) {
        setState({ key: storageKey, tree: load(storageKey) });
    }
    const tree = state.tree;

    const commit = useCallback(() => {
        save(storageKey, tree);
        setVersion((v) => v + 1);
    }, [storageKey, tree]);

    const touch = useCallback((key, value) => { tree.touch(key, value); commit(); }, [tree, commit]);
    const access = useCallback((key) => { const v = tree.search(key); commit(); return v; }, [tree, commit]);
    const remove = useCallback((key) => { tree.deleteNode(key); commit(); }, [tree, commit]);

    const items = order === "mostAccessed" ? tree.mostAccessed(limit) : tree.mostRecent(limit);
    const all = tree.inOrder(); // every entry, for stats like category affinity

    const has = (key) => tree.has(key);

    return { items, all, has, touch, access, remove, size: tree.size, version };
}
