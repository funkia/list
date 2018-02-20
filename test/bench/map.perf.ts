import * as _ from "lodash";

import { benchmark } from "./report";

import * as Immutable from "immutable";
import * as Finger from "@paldepind/finger-tree";

import * as Benchmark from "benchmark";

import * as L from "../../dist/index";
import * as Lo from "./list-old/dist/index";

function square(n: number): number {
  return n * n;
}

let array = [];
let tree = Finger.nil;
let immut = Immutable.List();
let l = L.empty();
let lOld = Lo.empty();

benchmark({
  name: "map",
  description: "maps a function over a sequence.",
  input: [20, 100, 500, 1000, 10000],
  before: (n) => {
    array = [];
    immut = Immutable.List();
    l = L.empty();
    lOld = Lo.empty();

    for (let i = 0; i < n; ++i) {
      tree = Finger.append(i, tree);
      immut = immut.push(i);
      array.push(i);
      l = L.append(i, l);
      lOld = Lo.append(i, lOld);
    }
  }
}, {
    "List": {
      run: () => {
        return L.map(square, l);
      }
    },
    "List, old": {
      run: () => {
        return Lo.map(square, lOld);
      }
    },
    "Array#map": {
      run: () => {
        return array.map(square);
      }
    },
    "Lodash": {
      run: () => {
        return _.map(array, square);
      }
    },
    "Immutable.js": {
      run: () => {
        return immut.map(square);
      }
    }
  });
