const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const mori = require("mori");

const {nil, append, concat} = require("../dist/finger");
const C = require("../dist/list");
const List = require("../dist/index");
const OldList = require("./list-old/dist/index");
const OldFinger = require("./list-old/dist/finger");

const n = 20000;

let arrayA = [];
let arrayB = [];
let treeA = nil;
let treeB = nil;
let oldTreeA = OldFinger.nil;
let oldTreeB = OldFinger.nil;
let consA = undefined;
let consB = undefined;
let listA = List.empty();
let listB = List.empty();
let oldListA = OldList.empty();
let oldListB = OldList.empty();

for (let i = 0; i < n; ++i) {
  arrayA.push(i);
  arrayB.push(i);
  treeA = append(i, treeA);
  treeB = append(i, treeB);
  listA = listA.append(i);
  listB = listB.append(i);
  oldListA = oldListA.append(i);
  oldListB = oldListB.append(i);
  oldTreeA = OldFinger.append(i, oldTreeA);
  oldTreeB = OldFinger.append(i, oldTreeB);
  consA = new C.Cons(i, consA);
  consB = new C.Cons(i, consB);
}
OldFinger.concat(oldTreeA, oldTreeB).size;
let immutA = new Immutable.List(arrayA);
let immutB = new Immutable.List(arrayB);

module.exports = Suite("concat")
  .add("Array", function () {
    return arrayA.concat(arrayB).length;
  })
  .add("Immutable.js", function () {
    return immutA.concat(immutB).size;
  })
  .add("Cons-list", function () {
    return C.concat(consA, consB);
  })
  .add("Finger", function () {
    return concat(treeA, treeB).size;
  })
  .add("Old finger", function () {
    return OldFinger.concat(oldTreeA, oldTreeB).size;
  })
  .add("List", function () {
    return List.concat(listA, listB).length;
  })
  .add("Old list", function () {
    return OldList.concat(oldListA, oldListB).length;
  })
  .run({ async: true });
