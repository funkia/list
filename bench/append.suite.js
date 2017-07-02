const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const Denque = require("denque");
const mori = require("mori");

const Finger = require("../dist/finger");
const Oinger = require("./finger-old/dist/finger");
const {Cons} = require("../dist/list");
const Radix = require("../dist/radix");

const n = 10000;

let tree = Finger.nil;
let radix = Radix.empty();
for (let i = 0; i < n; ++i) {
  tree = Finger.append(i, tree);
  radix = radix.append(i);
}
console.log(tree.suffix.c);

module.exports = Suite("append")
  .add("Array", function() {
    let arr = [];
    for (let i = 0; i < n; ++i) {
      arr.push(i);
    }
    return arr.length === n;
  })
  .add("Pure array", function() {
    let arr = [];
    for (let i = 0; i < n; ++i) {
      arr = arr.concat([i]);
    }
    return arr.length === n;
  })
  .add("Immutable.js", function() {
    let list = new Immutable.List();
    for (let i = 0; i < n; ++i) {
      list = list.push(i);
    }
    return list.size === n;
  })
  .add("Denque", function() {
    let denque = new Denque();
    for (let i = 0; i < n; ++i) {
      denque.push(i);
    }
    return denque.length === n;
  })
  .add("mori", function () {
    let list = mori.vector();
    for (let i = 0; i < n; ++i) {
      list = mori.conj(list, i);
    }
    return mori.count(list);
  })
  .add("Cons", function() {
    let cons = undefined;
    for (let i = 0; i < n; ++i) {
      cons = new Cons(i, cons);
    }
    return cons.value === n - 1;
  })
  .add("Radix", function () {
    let radix = Radix.empty();
    for (let i = 0; i < n; ++i) {
      radix = radix.append(i);
    }
    return radix.size === n;
  })
  .add("Finger", function() {
    let tree = Finger.nil;
    for (let i = 0; i < n; ++i) {
      tree = Finger.append(i, tree);
    }
    return tree.suffix.c === n - 1;
  })
  .add("Old finger", function() {
    let tree = Oinger.nil;
    for (let i = 0; i < n; ++i) {
      tree = Oinger.append(i, tree);
    }
    return tree.suffix.c === n - 1;
  })
  .run({async: true});
