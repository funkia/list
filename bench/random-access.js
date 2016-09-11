const shuffle = require("knuth-shuffle").knuthShuffle;
const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const Denque = require("denque");

const Finger = require("../dist/finger");
const {Cons} = require("../dist/list");

const n = 10000;

let indices = [];
let array = [];
let denque = new Denque();
let immut = new Immutable.List();
let tree = undefined;

for (let i = 0; i < n; ++i) {
  tree = Finger.append(i, tree);
  denque.push(i);
  array.push(i);
  indices.push(i);
  immut = immut.push(i);
}

shuffle(indices);

module.exports = Suite("random access")
  .add("Array", function() {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += array[i];
    }
    return sum === 9;
  })
  .add("Immutable.js", function() {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += immut.get(i);
    }
    return sum === 9;
  })
  .add("Deque", function() {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += denque.peekAt(i);
    }
    return sum === 9;
  })
  .run();
