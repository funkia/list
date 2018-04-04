"use strict";

var L = require("list");

exports._eq = L.equalsWith;
exports._append = L.concat;
exports._mempty = L.empty;
exports._map = L.map;
exports._apply = L.ap;
exports._pure = L.of;
exports._foldl = L.foldl;
exports._foldr = L.foldr;
exports._bind = L.chain;
exports._traverse = function () {
  function Cont(fn) {
    this.fn = fn;
  }

  function cons(x) {
    return function (xs) {
      return L.prepend(x, xs);
    };
  }

  return function (apply, map, pure, f) {
    var buildFrom = function (x, ys) {
      return apply(map(cons)(f(x)))(ys);
    };

    var go = function (acc, currentLen, xs) {
      if (currentLen === 0) {
        return acc;
      } else {
        var last = L.nth(currentLen - 1, xs);
        return new Cont(function () {
          return go(buildFrom(last, acc), currentLen - 1, xs);
        });
      }
    };

    return function _traverse(l) {
      var result = go(pure(L.empty()), l.length, l);
      while (result instanceof Cont) {
        result = result.fn();
      }

      return result;
    };
  };
}();

exports._show = function (f, xs) {
  return "fromFoldable [" + L.join(", ", L.map(f, xs)) + "]";
};

exports._unfoldr = function (isNothing, fromJust, fst, snd, f, b) {
  var result = L.empty();
  var value = b;
  while (true) { // eslint-disable-line no-constant-condition
    var maybe = f(value);
    if (isNothing(maybe)) return result;
    var tuple = fromJust(maybe);
    result.push(fst(tuple));
    value = snd(tuple);
  }
};
