const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const mori = require("mori");

const {nil, append, concat} = require("../dist/finger");
const C = require("../dist/list");
const Radix = require("../dist/radix");
const Oinger = require("./finger-old/dist/finger");

const n = 200;

let arrayA = [];
let arrayB = [];
let treeA = nil;
let treeB = nil;
let oldTreeA = Oinger.nil;
let oldTreeB = Oinger.nil;
let consA = undefined;
let consB = undefined;
let radixA = Radix.empty();
let radixB = Radix.empty();

for (let i = 0; i < n; ++i) {
  arrayA.push(i);
  arrayB.push(i);
  treeA = append(i, treeA);
  treeB = append(i, treeB);
  radixA = radixA.append(i);
  radixB = radixB.append(i);
  oldTreeA = Oinger.append(i, oldTreeA);
  oldTreeB = Oinger.append(i, oldTreeB);
  consA = new C.Cons(i, consA);
  consB = new C.Cons(i, consB);
}
Oinger.concat(oldTreeA, oldTreeB).size;
let listA = new Immutable.List(arrayA);
let listB = new Immutable.List(arrayB);

module.exports = Suite("concat")
  .add("Array", function () {
    return arrayA.concat(arrayB).length;
  })
  .add("Immutable.js", function () {
    return listA.concat(listB).size;
  })
  .add("Cons-list", function () {
    return C.concat(consA, consB);
  })
  .add("Finger", function () {
    return concat(treeA, treeB).size;
  })
  .add("Old finger", function () {
    return Oinger.concat(oldTreeA, oldTreeB).size;
  })
  .add("Radix", function () {
    return Radix.concat(radixA, radixB).size;
  })
  .run({ async: true });
