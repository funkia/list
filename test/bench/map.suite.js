const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const _ = require("lodash");

const List = require("../../dist/index");
const OldList = require("./list-old/dist/index");

const result = 1;

const suite = Suite("map");

function square(n) {
  return n * n;
}

function addBenchmark(n) {
  let array = [];
  let immut = new Immutable.List();
  let list = List.empty();
  let oldList = OldList.empty();

  for (let i = 0; i < n; ++i) {
    list = list.append(i);
    oldList = oldList.append(i);
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
      return List.mapArray(square, array);
    })
    .add("List " + n, function () {
      return List.map(square, list);
    });
}

addBenchmark(10);
// addBenchmark(50);
// addBenchmark(100);
addBenchmark(1000);

suite.run({ async: true })

module.exports = suite;