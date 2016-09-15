const util = require('util');
const {nil, append, get} = require("../dist/finger");

const n = 10000;

let tree = nil;

for (let i = 0; i < n; ++i) {
  tree = append(i, tree);
}

let sum = 0;

for (let i = 0; i < n; ++i) {
  sum += get(i, tree);
}

console.log(sum);
console.log(tree.suffix.c);
