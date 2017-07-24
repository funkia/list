const shuffle = require("knuth-shuffle").knuthShuffle;
const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const Denque = require("denque");

const Radix = require("../dist/radix");
const OldRadix = require("./finger-old/dist/radix");
const Finger = require("../dist/finger");
const Oinger = require("./finger-old/dist/finger");
const {Cons} = require("../dist/list");

const n = 10000;

let indices = [];
let array = [];
let denque = new Denque();
let immut = new Immutable.List();
let tree = Finger.nil;
let _tree = Oinger.nil;
let radix = Radix.empty();
let oldRadix = OldRadix.empty();

for (let i = 0; i < n; ++i) {
  tree = Finger.append(i, tree);
  _tree = Oinger.append(i, _tree);
  radix = radix.append(i);
  oldRadix = oldRadix.append(i);
  denque.push(i);
  array.push(i);
  indices.push(i);
  immut = immut.push(i);
}

const result = 49995000;

shuffle(indices);

module.exports = Suite("random access")
  .add("Array", function() {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += array[i];
    }
    return sum === result;
  })
  .add("Immutable.js", function() {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += immut.get(i);
    }
    return sum === result;
  })
  .add("Deque", function() {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += denque.peekAt(i);
    }
    return sum === result;
  })
  .add("Radix", function () {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += radix.nth(i);
    }
    return sum === result;
  })
  .add("Old radix", function () {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += oldRadix.nth(i);
    }
    return sum === result;
  })
  .add("Finger", function() {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += Finger.get(i, tree);
    }
    return sum === result;
  })
  .add("Old finger", function() {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += Oinger.get(i, _tree);
    }
    return sum === result;
  })
  .run({async: true});
