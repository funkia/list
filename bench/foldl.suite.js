const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const Denque = require("denque");

const Finger = require("../dist/finger");
const Oinger = require("./finger-old/dist/finger");
const {Cons} = require("../dist/list");

const n = 10000;

let array = [];
let tree = Finger.nil;
let list = new Immutable.List();

for (let i = 0; i < n; ++i) {
  tree = Finger.append(i, tree);
  list = list.push(i);
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

console.log(arrayFold(subtract, 10, array));
console.log(list.reduce(subtract, 10));
console.log(Finger.foldl(subtract, 10, tree));

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
  .add("Finger", function() {
    return Finger.foldl(subtract, 10, tree);
  })
  // .add("Old finger", function() {
  //   let tree = Oinger.nil;
  //   for (let i = 0; i < n; ++i) {
  //     tree = Oinger.append(i, tree);
  //   }
  //   return tree.suffix.c === n - 1;
  // })
  .run({async: true});
