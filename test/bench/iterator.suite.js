const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");

const List = require("../../dist/index");
const OldList = require("./list-old/dist/index");

const result = 1;

const suite = Suite("Iterator");

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
    .add("Array " + n, function() {
      let sum = 0;
      for (const n of array) {
        sum += n;
      }
      return sum === result;
    })
    .add("Immutable.js " + n, function() {
      let sum = 0;
      for (const n of immut) {
        sum += n;
      }
      return sum === result;
    })
    .add("List " + n, function() {
      let sum = 0;
      for (const n of list) {
        sum += n;
      }
      return sum === result;
    })
    .add("List old " + n, function() {
      let sum = 0;
      for (const n of oldList) {
        sum += n;
      }
      return sum === result;
    });
}

addBenchmark(10);
addBenchmark(50);
addBenchmark(100);
addBenchmark(1000);

suite.run({ async: true });

module.exports = suite;
