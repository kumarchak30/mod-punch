import assert from "node:assert/strict";
import { SplayTree } from "../src/data_structures/SplayTree.js";

// small tree to check splaying by eye
const tree = new SplayTree();
for (const id of ["sodium", "lithium", "iris", "jei", "create", "fabric-api"]) {
    tree.insertNode(id, { title: id });
}
tree.print();
assert.equal(tree.size, 6);
assert.equal(tree.root.key, "fabric-api"); // last inserted is the root

// search moves it to the root and counts the access
assert.deepEqual(tree.search("iris"), { title: "iris" });
assert.equal(tree.root.key, "iris");
tree.search("iris");
tree.search("sodium");
assert.equal(tree.root.key, "sodium");

// misses don't break anything
assert.equal(tree.search("not-a-mod"), undefined);
assert.equal(tree.size, 6);

// in-order stays sorted no matter how much we splay
const keys = tree.inOrder().map((e) => e.key);
assert.deepEqual(keys, [...keys].sort());

// views for the profile page
assert.equal(tree.mostAccessed(1)[0].key, "iris"); // 3 accesses
tree.touch("jei", { title: "jei" });
assert.equal(tree.mostRecent(1)[0].key, "jei");
assert.equal(tree.levelOrder(1)[0].key, "jei");

// re-inserting an existing key updates instead of duplicating
tree.insertNode("jei", { title: "JEI" });
assert.equal(tree.size, 6);
assert.deepEqual(tree.peek("jei"), { title: "JEI" });

// delete
assert.equal(tree.deleteNode("create"), true);
assert.equal(tree.deleteNode("create"), false);
assert.equal(tree.has("create"), false);
assert.equal(tree.size, 5);

// save / load keeps shape + stats
const copy = SplayTree.fromJSON(JSON.parse(JSON.stringify(tree)));
assert.deepEqual(copy.toJSON(), tree.toJSON());
assert.equal(copy.root.key, tree.root.key);

// bigger random test against a Map
const big = new SplayTree();
const ref = new Map();
for (let i = 0; i < 20000; i++) {
    const k = Math.floor(Math.random() * 2000);
    const op = Math.random();
    if (op < 0.5) { big.insertNode(k, i); ref.set(k, i); }
    else if (op < 0.8) assert.equal(big.search(k), ref.get(k));
    else assert.equal(big.deleteNode(k), ref.delete(k));
}
assert.equal(big.size, ref.size);
assert.deepEqual(big.inOrder().map((e) => e.key), [...ref.keys()].sort((a, b) => a - b));

console.log("all splay tree tests passed");
