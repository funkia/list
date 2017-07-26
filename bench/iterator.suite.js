const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");

const Radix = require("../dist/radix");
const OldRadix = require("./finger-old/dist/radix");

const result = 1;

const suite = Suite("Iterator");

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
    .add("Array " + n, function () {
      let sum = 0;
      for (const n of array) {
        sum += n;
      }
      return sum === result;
    })
    .add("Immutable.js " + n, function () {
      let sum = 0;
      for (const n of immut) {
        sum += n;
      }
      return sum === result;
    })
    .add("Radix " + n, function () {
      let sum = 0;
      for (const n of radix) {
        sum += n;
      }
      return sum === result;
    });
}

addBenchmark(10);
addBenchmark(50);
addBenchmark(100);
addBenchmark(1000);

suite.run({ async: true })

module.exports = suite;