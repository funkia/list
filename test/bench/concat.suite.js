const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const mori = require("mori");

const { nil, append, concat } = require("@paldepind/finger-tree");
const C = require("../../dist/list");
const List = require("../../dist/index");
require("../../dist/methods");

const n = 20000;

let arrayA = [];
let arrayB = [];
let treeA = nil;
let treeB = nil;
let consA = undefined;
let consB = undefined;
let listA = List.empty();
let listB = List.empty();

for (let i = 0; i < n; ++i) {
  arrayA.push(i);
  arrayB.push(i);
  treeA = append(i, treeA);
  treeB = append(i, treeB);
  listA = listA.append(i);
  listB = listB.append(i);
  consA = new C.Cons(i, consA);
  consB = new C.Cons(i, consB);
}
let immutA = new Immutable.List(arrayA);
let immutB = new Immutable.List(arrayB);

module.exports = Suite("concat")
  .add("Array", function() {
    return arrayA.concat(arrayB).length;
  })
  .add("Immutable.js", function() {
    return immutA.concat(immutB).size;
  })
  .add("Cons-list", function() {
    return C.concat(consA, consB);
  })
  .add("Finger", function() {
    return concat(treeA, treeB).size;
  })
  .add("List", function() {
    return List.concat(listA, listB).length;
  })
  .run({ async: true });
