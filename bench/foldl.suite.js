const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const Denque = require("denque");
const mori = require("mori");

const Finger = require("../dist/finger");
const Oinger = require("./finger-old/dist/finger");
const {Cons} = require("../dist/list");

const n = 10000;

let array = [];
let tree = Finger.nil;
let list = new Immutable.List();
let mlist = mori.vector();

for (let i = 0; i < n; ++i) {
  tree = Finger.append(i, tree);
  list = list.push(i);
  mlist = mori.conj(mlist, i);
  array.push(i);
}

function arrayFold(f, initial, array) {
  let value = initial;
  for (var i = 0; i < array.length; ++i) {
    value = f(value, array[i]);
  }
  return value;
}

function subtract(n, m) {
  return n - m;
}

module.exports = Suite("foldl")
  .add("Array", function() {
    return array.reduce(subtract, 10);
  })
  .add("Array manual fold", function() {
    return arrayFold(subtract, 10, array);
  })
  .add("Immutable.js", function() {
    return list.reduce(subtract, 10);
  })
  .add("Mori", function () {
    return mori.reduce(subtract, 10, mlist);
  })
  .add("Finger", function() {
    return Finger.foldl(subtract, 10, tree);
  })
  .run({async: true});
