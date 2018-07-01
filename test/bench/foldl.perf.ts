const shuffle = require("knuth-shuffle").knuthShuffle;

import * as _ from "lodash";

import { benchmark } from "./report";

import * as mori from "mori";
import * as Immutable from "immutable";
import * as Finger from "@paldepind/finger-tree";

import * as Benchmark from "benchmark";

import * as L from "../../dist/index";
import * as Lo from "./list-old/dist/index";

function arrayFold<A>(f, initial: A, array: A[]): A {
  let value = initial;
  for (var i = 0; i < array.length; ++i) {
    value = f(value, array[i]);
  }
  return value;
}

arrayFold((n, m) => n + m, 0, [0, 1, 2, 3]);
arrayFold((n, m) => n - m, 0, [0, 1, 2, 3]);
L.foldl((n, m) => n + m, 0, L.list(0, 1, 2, 3));
L.foldl((n, m) => n - m, 0, L.list(0, 1, 2, 3));
Lo.foldl((n, m) => n + m, 0, Lo.list(0, 1, 2, 3));
Lo.foldl((n, m) => n - m, 0, Lo.list(0, 1, 2, 3));

function subtract(n: number, m: number) {
  return n - m;
}

let array = [];
let tree = Finger.nil;
let immut = Immutable.List();
let mlist = mori.vector();
let l = L.empty();
let lOld = Lo.empty();

benchmark(
  {
    name: "foldl",
    description: "foldl/reduce over a sequence.",
    input: [20, 100, 1000, 10000],
    before: n => {
      array = [];
      tree = Finger.nil;
      immut = Immutable.List();
      mlist = mori.vector();
      l = L.empty();
      lOld = Lo.empty();

      for (let i = 0; i < n; ++i) {
        tree = Finger.append(i, tree);
        immut = immut.push(i);
        mlist = mori.conj(mlist, i);
        array.push(i);
        l = L.append(i, l);
        lOld = Lo.append(i, lOld);
      }
    }
  },
  {
    List: {
      run: () => {
        return L.foldl(subtract, 10, l);
      }
    },
    "List, old": {
      run: () => {
        return Lo.foldl(subtract, 10, lOld);
      }
    },
    "Array#reduce": {
      run: () => {
        return array.reduce(subtract, 10);
      }
    },
    "Array manual fold": {
      run: () => {
        return arrayFold(subtract, 10, array);
      }
    },
    Lodash: {
      run: () => {
        return _.reduce(array, subtract, 10);
      }
    },
    "Immutable.js": {
      run: () => {
        return immut.reduce(subtract, 10);
      }
    },
    Mori: {
      run: () => {
        return mori.reduce(subtract, 10, mlist);
      }
    },
    Finger: {
      run: () => {
        return Finger.foldl(subtract, 10, tree);
      }
    }
  }
);
