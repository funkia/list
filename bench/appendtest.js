const Finger = require("../dist/finger");

const n = 10000;

let tree = undefined;
for (let i = 0; i < n; ++i) {
  tree = Finger.append(i, tree);
}

console.log(tree.suffix[tree.suffix.length - 1]);
