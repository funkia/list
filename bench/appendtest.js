const util = require('util');
const {nil, append, get} = require("../dist/finger");
const shuffle = require("knuth-shuffle").knuthShuffle;

const n = 10000;

let tree = nil;
let indices = [];

for (let i = 0; i < n; ++i) {
  indices.push(i);
  tree = append(i, tree);
}

let sum = 0;

for (let i = 0; i < n; ++i) {
  sum += get(i, tree);
}

shuffle(indices);

console.log(sum);
