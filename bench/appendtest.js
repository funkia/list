const util = require('util');
const Finger = require("../dist/finger");

const n = 10000;

let tree = Finger.nil;

for (let i = 0; i < n; ++i) {
  tree = Finger.append(i, tree);
}

console.log(util.inspect(tree, {depth: 4}));
console.log(tree.suffix.c);
