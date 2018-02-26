const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const Denque = require("denque");

const L = require("../../dist/index");
const Finger = require("@paldepind/finger-tree");
const {Cons} = require("./list");

const n = 10000;

module.exports = Suite("prepend")
  .add("Array", function() {
    let arr = [];
    for (let i = 0; i < n; ++i) {
      arr.unshift(i);
    }
    return arr.length === n;
  })
  .add("Pure array", function() {
    let arr = [];
    for (let i = 0; i < n; ++i) {
      arr = [i].concat(arr);
    }
    return arr.length === n;
  })
  .add("Immutable.js", function() {
    let list = new Immutable.List();
    for (let i = 0; i < n; ++i) {
      list = list.unshift(i);
    }
    return list.size === n;
  })
  .add("Denque", function() {
    let denque = new Denque();
    for (let i = 0; i < n; ++i) {
      denque.unshift(i);
    }
    return denque.length === n;
  })
  .add("Cons", function() {
    let cons = undefined;
    for (let i = 0; i < n; ++i) {
      cons = new Cons(i, cons);
    }
    return cons.value === n - 1;
  })
  .add("List", function () {
    let list = L.empty();
    for (let i = 0; i < n; ++i) {
      list = L.prepend(i, list);
    }
    return list.length === n - 1;
  })
  .add("Finger", function() {
    let tree = Finger.nil;
    for (let i = 0; i < n; ++i) {
      tree = Finger.prepend(i, tree);
    }
    return tree.suffix.c === n - 1;
  })
  .run({async: true});
