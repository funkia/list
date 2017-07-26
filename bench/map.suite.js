const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const _ = require("lodash");

const Radix = require("../dist/radix");
const OldRadix = require("./finger-old/dist/radix");

const result = 1;

const suite = Suite("map");

function square(n) {
  return n * n;
}

function addBenchmark(n) {
  let array = [];
  let immut = new Immutable.List();
  let radix = Radix.empty();
  let oldRadix = OldRadix.empty();

  for (let i = 0; i < n; ++i) {
    radix = radix.append(i);
    oldRadix = oldRadix.append(i);
    array.push(i);
    immut = immut.push(i);
  }

  suite
    .add("Array#map " + n, function () {
      return array.map(square);
    })
    .add("Lodash " + n, function () {
      return _.map(array, square);
    })
    .add("Immutable.js " + n, function () {
      return immut.map(square);
    })
    .add("mapArray " + n, function () {
      return Radix.mapArray(square, array);
    })
    .add("Radix " + n, function () {
      return Radix.map(square, radix);
    });
}

addBenchmark(10);
// addBenchmark(50);
// addBenchmark(100);
addBenchmark(1000);

suite.run({ async: true })

module.exports = suite;