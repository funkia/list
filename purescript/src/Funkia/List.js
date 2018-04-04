"use strict";

var L = require("list");

exports.length = L.length;
exports._filter = L.filter;

exports.unsafeHead = L.first;
exports.unsafeLast = L.last;
exports.unsafeTail = L.tail;
exports.unsafeInit = L.init;
exports._unsafeIndex = function _unsafeIndex(l, i) {
  return L.nth(i, l);
};

exports.reverse = L.reverse;
exports.concat = L.flatten;
exports.splitAt = L.splitAt;

exports.remove = L.remove;
exports._range = L.range;
exports._replicate = function _replicate(n, a) {
  return L.repeat(a, n);
};

exports._cons = L.prepend;
exports._snoc = function _snoc(l, a) {
  return L.append(a, l);
};

exports._insertAt = L.insert;
exports._findIndex = L.findIndex;
exports._take = L.take;
exports._drop = L.drop;
exports._takeEnd = L.takeLast;
exports._dropEnd = L.dropLast;
exports._zipWith = L.zipWith;
exports._takeWhile = L.takeWhile;
exports._dropWhile = L.dropWhile;
exports._modifyAt = L.adjust;
exports._updateAt = L.update;
exports._slice = L.slice;
exports._partition = L.partition;
exports._sort = L.sort;

// The names of these two functions are flipped in purescript-arrays and funkia/list
exports._sortBy = L.sortWith;
exports._sortWith = L.sortBy;
