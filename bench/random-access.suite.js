const shuffle = require("knuth-shuffle").knuthShuffle;
const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const Denque = require("denque");

const List = require("../dist/index");
const OldList = require("./list-old/dist/index");
const Finger = require("@paldepind/finger-tree");
const {Cons} = require("../dist/list");

const n = 10000;

let indices = [];
let array = [];
let denque = new Denque();
let immut = new Immutable.List();
let tree = Finger.nil;
let list = List.empty();
let oldList = OldList.empty();

for (let i = 0; i < n; ++i) {
  tree = Finger.append(i, tree);
  list = list.append(i);
  oldList = oldList.append(i);
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
  .add("List", function () {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += list.nth(i);
    }
    return sum === result;
  })
  .add("Old list", function () {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += oldList.nth(i);
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
  .run({async: true});
