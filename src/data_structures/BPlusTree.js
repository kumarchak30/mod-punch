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


    //  keys[i] > key
    upperBound(keys, key) {
        let l = 0;
        let r = keys.length;
        while (l < r) {
            const mid = Math.floor((l + r) / 2);
            if (this.compare(keys[mid], key) <= 0) l = mid + 1;
            else r = mid;
        }
        return l;
    }

    // root down to leaf until it reaches where the key belongs
    findLeaf(key) {
        let node = this.root;
        while (!node.isLeaf) {
            node = node.children[this.upperBound(node.keys, key)];
        }
        return node;
    }

    // returns value of key being searched or undefined when not found
    search(key) {
        const leaf = this.findLeaf(key);
        const i = this.lowerBound(leaf.keys, key);
        if (i < leaf.keys.length && this.compare(leaf.keys[i], key) === 0) {
            return leaf.values[i];
        }
        return undefined;
    }

    insertNode(key, value) {
        const split = this.insertInto(this.root, key, value);

        // make new root above the two halves
        if (split) {
            const newRoot = new InternalNode();
            newRoot.keys.push(split.key);
            newRoot.children.push(this.root, split.right);
            this.root = newRoot;
        }
    }   


    deleteNode(key) {
        const leaf = this.findLeaf(key);
        const i = this.lowerBound(leaf.keys, key);

        // deletes a node of the specific key, and does not take from siblings and does not merge any existing nodes
        if (i < leaf.keys.length && this.compare(leaf.keys[i], key) === 0) {
            leaf.keys.splice(i, 1);
            leaf.values.splice(i, 1);
            this.size--;
            return true; // if found and removed
        }
        return false; // invalid key, key not found, etc.
    }

    /* 
        insertInto logic:
        recursively insert node with key + value pair
        returns null, or { key, right } if this node is split
    */
    insertInto(node, key, value) {
        if (node.isLeaf) {
            const i = this.lowerBound(node.keys, key);

            // update value if same key is already there
            if (i < node.keys.length && this.compare(node.keys[i], key) === 0) {
                node.values[i] = value;
                return null;
            }

            node.keys.splice(i, 0, key);
            node.values.splice(i, 0, value);
            this.size++;

            if (node.keys.length > this.maxKeys) return this.splitLeaf(node);
            return null;
        }

        // go down into the right child (internal node)
        const i = this.upperBound(node.keys, key);
        const split = this.insertInto(node.children[i], key, value);
        if (!split) return null;

        // add its separator and new right child here by splicing/splitting
        node.keys.splice(i, 0, split.key);
        node.children.splice(i + 1, 0, split.right); 

        if (node.keys.length > this.maxKeys) return this.splitInternal(node);
        return null;
    }

    /* 
        LEAF SPLIT:
        right half moves to the new leaf -> first key copied up
     */
    splitLeaf(leaf) {
        const mid = Math.floor(leaf.keys.length / 2);
        const right = new LeafNode();

        right.keys = leaf.keys.splice(mid);
        right.values = leaf.values.splice(mid);

        right.next = leaf.next;
        leaf.next = right;

        return { key: right.keys[0], right };
    }


    /*
        INTERNAL SPLIT:
        middle key moves up the B+ tree
        then gets removed from this level 
    */
    splitInternal(node) {
        const mid = Math.floor(node.keys.length / 2);
        const upKey = node.keys[mid];
        const right = new InternalNode();

        right.keys = node.keys.splice(mid + 1);
        right.children = node.children.splice(mid + 1);

        // removes upKey from the left B+ tree node
        node.keys.pop(); 

        return { key: upKey, right };
    }


    /*
        go through the linked leaves starting from startKey
        stopWhen(key) stop = true like wrong version
        filter(key, value) skip = false such as wrong category
        offset + limit is for paging
        returns an array of values (for the mods)
    */
    rangeScan(startKey, { stopWhen, filter, offset = 0, limit = Infinity } = {}) {
        const results = [];
        let skipped = 0;

        let leaf = this.findLeaf(startKey);
        let i = this.lowerBound(leaf.keys, startKey);

        while (leaf) {
            while (i < leaf.keys.length) {
                const key = leaf.keys[i];
                const value = leaf.values[i];

                if (stopWhen && stopWhen(key)) return results;

                if (!filter || filter(key, value)) {
                    if (skipped < offset) {
                        skipped++;
                    } else {
                        results.push(value);
                        if (results.length >= limit) return results;
                    }
                }
                i++;
            }
            leaf = leaf.next;
            i = 0;
        }
        return results;
    }

    // prints each level and checks for splits handling smaller maxKeys 
    print(format = (k) => JSON.stringify(k)) {
        let level = [this.root];
        while (level.length > 0) {
            console.log(level.map((n) => "[" + n.keys.map(format).join(" | ") + "]").join("  "));
            level = level.flatMap((n) => (n.isLeaf ? [] : n.children));
        }
    }
}