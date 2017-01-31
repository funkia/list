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

const l4 = append(3, append(2, append(1, append(0, nil))));
const s4 = get(0, l4) + get(1, l4) + get(2, l4) + get(3, l4);
console.log(s4);

function run() {
  for (var j = 0; j < 10000; ++j) {
    for (var i = 0; i < n; ++i) {
      sum += get(i, tree);
    }
  }
}

if (typeof document !== "undefined") {
  document.getElementById("start").addEventListener("click", function() {
    run();
  });
}
