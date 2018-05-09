import { benchmark } from "./report";

const L = require("../../dist/index");

function subtract(n: number, m: number) {
  return n - m;
}

let l;

benchmark(
  {
    name: "foldl vs iterator",
    description: "Iterating over a list with foldl vs with an iterator.",
    input: [100, 1000, 10000],
    before: n => {
      l = L.empty();
      for (let i = 0; i < n; ++i) {
        l = L.append(i, l);
      }
    }
  },
  {
    "List, foldl": () => {
      return L.foldl(subtract, 10, l);
    },
    "List, iterator, for-of": () => {
      var result = 10;
      for (var cur of l) {
        result = subtract(result, cur);
      }
      return result;
    },
    "List, iterator, manual": () => {
      var iterator = l[Symbol.iterator]();
      var result = 10;
      var cur;
      while ((cur = iterator.next()).done === false) {
        result = subtract(result, cur.value);
      }
      return result;
    }
  }
);
