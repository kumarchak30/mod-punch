/* STRUCTURE:
    Self-adjusting binary search tree used for the profile page
    (recent searches + mods a user has added).

    Every access (search, insert, touch) "splays" that node to the root,
    so whatever the user used most recently sits at the top of the tree and
    things they use often stay near the top. Lookups are O(log n) amortized.

    key is anything the compare function understands (default: strings / numbers,
    e.g. a search query or a Modrinth mod id)
    value is whatever we want to show (mod info, query text, etc.)
*/
export function defaultCompare(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

/* SPLAY TREE NODE CLASS */
class SplayNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.accessCount = 1;          // how many times the user touched this item
        this.lastAccessed = 0;          // timestamp of the latest touch (set by the tree)
    }
}


export class SplayTree {
    constructor(compare = defaultCompare) {
        this.compare = compare;
        this.root = null;
        this.size = 0;
        this.lastStamp = 0;
    }

    // Date.now() but never repeats, so two touches in the same millisecond still have an order
    stamp() {
        this.lastStamp = Math.max(Date.now(), this.lastStamp + 1);
        return this.lastStamp;
    }


    /*
        ROTATIONS:
        rotateLeft(x)  -> x's right child moves up and x becomes its left child
        rotateRight(x) -> x's left child moves up and x becomes its right child
    */
    rotateLeft(x) {
        const y = x.right;
        x.right = y.left;
        if (y.left) y.left.parent = x;

        y.parent = x.parent;
        if (!x.parent) this.root = y;
        else if (x === x.parent.left) x.parent.left = y;
        else x.parent.right = y;

        y.left = x;
        x.parent = y;
    }

    rotateRight(x) {
        const y = x.left;
        x.left = y.right;
        if (y.right) y.right.parent = x;

        y.parent = x.parent;
        if (!x.parent) this.root = y;
        else if (x === x.parent.right) x.parent.right = y;
        else x.parent.left = y;

        y.right = x;
        x.parent = y;
    }


    /*
        SPLAY:
        keep rotating x up until it is the root
        zig        -> parent is root, one rotation
        zig-zig    -> x and parent are on the same side, rotate grandparent first
        zig-zag    -> x and parent on opposite sides, rotate parent then grandparent
    */
    splay(x) {
        while (x.parent) {
            const p = x.parent;
            const g = p.parent;

            if (!g) {
                // zig
                if (x === p.left) this.rotateRight(p);
                else this.rotateLeft(p);
            } else if (x === p.left && p === g.left) {
                // zig-zig (left left)
                this.rotateRight(g);
                this.rotateRight(p);
            } else if (x === p.right && p === g.right) {
                // zig-zig (right right)
                this.rotateLeft(g);
                this.rotateLeft(p);
            } else if (x === p.right && p === g.left) {
                // zig-zag (left right)
                this.rotateLeft(p);
                this.rotateRight(g);
            } else {
                // zig-zag (right left)
                this.rotateRight(p);
                this.rotateLeft(g);
            }
        }
    }


    // walks down like a normal BST; returns the matching node or the last node visited
    findNodeOrLast(key) {
        let node = this.root;
        let last = null;
        while (node) {
            last = node;
            const c = this.compare(key, node.key);
            if (c === 0) return node;
            node = c < 0 ? node.left : node.right;
        }
        return last;
    }


    /*
        returns the value of key or undefined when not found
        found node gets splayed to the root and its access stats go up
        (on a miss we still splay the last node visited, which is what keeps it amortized O(log n))
    */
    search(key) {
        const node = this.findNodeOrLast(key);
        if (!node) return undefined;

        this.splay(node);
        if (this.compare(key, node.key) !== 0) return undefined;

        node.accessCount++;
        node.lastAccessed = this.stamp();
        return node.value;
    }

    // same as search but doesn't count as a user access (no splay, no stats change)
    peek(key) {
        const node = this.findNodeOrLast(key);
        if (node && this.compare(key, node.key) === 0) return node.value;
        return undefined;
    }

    has(key) {
        return this.peek(key) !== undefined;
    }


    /*
        insertNode logic:
        if the key already exists -> update value, count it as an access, splay it
        otherwise -> attach as a leaf like a normal BST, then splay it to the root
    */
    insertNode(key, value) {
        if (!this.root) {
            this.root = new SplayNode(key, value);
            this.root.lastAccessed = this.stamp();
            this.size++;
            return this.root;
        }

        const last = this.findNodeOrLast(key);
        const c = this.compare(key, last.key);

        if (c === 0) {
            last.value = value;
            last.accessCount++;
            last.lastAccessed = this.stamp();
            this.splay(last);
            return last;
        }

        const node = new SplayNode(key, value);
        node.lastAccessed = this.stamp();
        node.parent = last;
        if (c < 0) last.left = node;
        else last.right = node;

        this.size++;
        this.splay(node);
        return node;
    }

    // what the UI calls when a user opens a mod / re-runs a search
    // inserts it if it is new, otherwise bumps it to the top
    touch(key, value) {
        return this.insertNode(key, value);
    }


    /*
        DELETE:
        splay the node to the root, cut it off, then join the two subtrees
        join = splay the biggest node of the left subtree, hang the right subtree off it
    */
    deleteNode(key) {
        const node = this.findNodeOrLast(key);
        if (!node) return false;

        this.splay(node);
        if (this.compare(key, node.key) !== 0) return false; // key not found

        const left = node.left;
        const right = node.right;
        if (left) left.parent = null;
        if (right) right.parent = null;

        if (!left) {
            this.root = right;
        } else {
            let max = left;
            while (max.right) max = max.right;
            this.root = left;
            this.splay(max); // max has no right child after this
            max.right = right;
            if (right) right.parent = max;
        }

        this.size--;
        return true;
    }


    /* TRAVERSALS / VIEWS FOR THE PROFILE PAGE */

    // sorted by key (alphabetical / id order)
    inOrder() {
        const out = [];
        const stack = [];
        let node = this.root;
        while (node || stack.length) {
            while (node) {
                stack.push(node);
                node = node.left;
            }
            node = stack.pop();
            out.push(this.toEntry(node));
            node = node.right;
        }
        return out;
    }

    /*
        level order (root first) = the splay tree's own idea of "hot" items
        root is the most recently used, and items near the top were touched recently/often
    */
    levelOrder(limit = Infinity) {
        const out = [];
        const queue = this.root ? [this.root] : [];
        let head = 0;
        while (head < queue.length && out.length < limit) {
            const node = queue[head++];
            out.push(this.toEntry(node));
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        return out;
    }

    // exact "most recent first" list (sorted by lastAccessed)
    mostRecent(limit = Infinity) {
        return this.inOrder()
            .sort((a, b) => b.lastAccessed - a.lastAccessed)
            .slice(0, limit);
    }

    // exact "most accessed first" list (ties broken by most recent)
    mostAccessed(limit = Infinity) {
        return this.inOrder()
            .sort((a, b) => b.accessCount - a.accessCount || b.lastAccessed - a.lastAccessed)
            .slice(0, limit);
    }

    toEntry(node) {
        return {
            key: node.key,
            value: node.value,
            accessCount: node.accessCount,
            lastAccessed: node.lastAccessed,
        };
    }


    /*
        SAVE / LOAD:
        toJSON stores nodes in pre-order so fromJSON can rebuild the exact same shape
        (so the "hot" items are still at the top after a reload)
    */
    toJSON() {
        const out = [];
        const stack = this.root ? [this.root] : [];
        while (stack.length) {
            const node = stack.pop();
            out.push(this.toEntry(node));
            if (node.right) stack.push(node.right);
            if (node.left) stack.push(node.left);
        }
        return out;
    }

    static fromJSON(entries, compare = defaultCompare) {
        const tree = new SplayTree(compare);
        for (const e of entries ?? []) {
            // plain BST insert without splaying keeps the saved shape
            const node = new SplayNode(e.key, e.value);
            node.accessCount = e.accessCount ?? 1;
            node.lastAccessed = e.lastAccessed ?? 0;
            tree.lastStamp = Math.max(tree.lastStamp, node.lastAccessed);

            if (!tree.root) {
                tree.root = node;
            } else {
                const last = tree.findNodeOrLast(e.key);
                const c = tree.compare(e.key, last.key);
                if (c === 0) continue; // duplicate in saved data, skip it
                node.parent = last;
                if (c < 0) last.left = node;
                else last.right = node;
            }
            tree.size++;
        }
        return tree;
    }


    // prints each level (like the B+ tree's print) to check splaying by eye
    print(format = (k) => JSON.stringify(k)) {
        let level = this.root ? [this.root] : [];
        while (level.length > 0) {
            console.log(level.map((n) => format(n.key)).join("  "));
            level = level.flatMap((n) => [n.left, n.right].filter(Boolean));
        }
    }
}
