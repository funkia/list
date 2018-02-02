const L = require("@funkia/list");
const Maybe = require("Data.Maybe");

function uncurry2(f) {
  return function(a, b) {
    return f(a)(b);
  };
}

function curry2(f) {
  return function(a) {
    return function(b) {
      return f(a, b);
    };
  };
}

function curry3(f) {
  return function(a) {
    return function(b) {
      return function(c) {
        return f(a, b, c);
      };
    };
  };
}

exports.pair = function pair(a) {
  return function(b) {
    return L.pair(a, b);
  };
};

exports.head = function head(l) {
  return l.length === 0 ? Maybe.Nothing : new Maybe.Just(L.first(l));
};

exports.empty = L.empty();

exports.cons = function cons(a) {
  return function(l) {
    return L.prepend(a, l);
  };
};

exports.snoc = function(l) {
  return function(a) {
    return L.append(a, l);
  };
};

exports._map = function(f) {
  return function(l) {
    return L.map(f, l);
  };
};

exports._append = function(left) {
  return function(right) {
    return L.concat(left, right);
  };
};

exports.filter = curry2(L.filter);

exports._foldr = function(f) {
  return function(acc) {
    return function(l) {
      return L.foldr(uncurry2(f), acc, l);
    };
  };
};

exports._foldl = function(f) {
  return function(acc) {
    return function(l) {
      return L.foldl(uncurry2(f), acc, l);
    };
  };
};
