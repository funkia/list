const Suite = require("./default-suite").Suite;
const Immutable = require("immutable");
const Denque = require("denque");
const mori = require("mori");

const Finger = require("@paldepind/finger-tree");
const { Cons } = require("../../dist/list");
const List = require("../../dist/index");
require("../../dist/methods");
const OldList = require("./list-old/dist/index");

const n = 100;

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
  .add("mori", function() {
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
  .add("List", function() {
    let list = List.empty();
    for (let i = 0; i < n; ++i) {
      list = list.append(i);
    }
    return list.length === n;
  })
  .add("Old List", function() {
    let list = OldList.empty();
    for (let i = 0; i < n; ++i) {
      list = list.append(i);
    }
    return list.length === n;
  })
  .add("Finger", function() {
    let tree = Finger.nil;
    for (let i = 0; i < n; ++i) {
      tree = Finger.append(i, tree);
    }
    return tree.suffix.c === n - 1;
  })
  .run({ async: true });
