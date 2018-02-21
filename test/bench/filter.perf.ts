import * as _ from "lodash";

import { benchmark } from "./report";

import * as Immutable from "immutable";

import * as Benchmark from "benchmark";

import * as L from "../../dist/index";
import * as Lo from "./list-old/dist/index";

function square(n: number): number {
  return n * n;
}

let array = [];
let immut = Immutable.List();
let l = L.empty();
let lOld = Lo.empty();

function isEven(n: number): boolean {
  return n % 2 === 0;
}

benchmark({
  name: "filter",
  description: "filters a sequence.",
  input: [20, 100, 500, 1000, 10000],
  before: (n) => {
    array = [];
    immut = Immutable.List();
    l = L.empty();
    lOld = Lo.empty();

    for (let i = 0; i < n; ++i) {
      immut = immut.push(i);
      array.push(i);
      l = L.append(i, l);
      lOld = Lo.append(i, lOld);
    }
  }
}, {
    "List": {
      run: () => {
        return L.filter(isEven, l);
      }
    },
    "List, old": {
      run: () => {
        return Lo.filter(isEven, lOld);
      }
    },
    "Array#filter": {
      run: () => {
        return array.filter(isEven);
      }
    },
    "Lodash": {
      run: () => {
        return _.filter(array, isEven);
      }
    },
    "Immutable.js": {
      run: () => {
        return immut.filter(isEven);
      }
    }
  });
