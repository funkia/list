const shuffle = require("knuth-shuffle").knuthShuffle;

import * as R from "ramda";

import { benchmark } from "./report";

import { List } from "immutable";


import * as L from "../../dist/index";
import "../../dist/methods";
import * as Lo from "./list-old/dist/index";
import "./list-old/dist/methods";

let arr: number[];
let l: any;
let imm: any;

function copyArray<A>(arr: A[]): A[] {
  const newArray = [];
  for (let i = 0; i < arr.length; ++i) {
    newArray.push(arr[i]);
  }
  return newArray;
}

function comparePrimitive(a: number, b: number): -1 | 0 | 1 {
  if (a === b) {
    return 0;
  } else if (a < b) {
    return -1;
  } else {
    return 1;
  }
}

function sortUnstable<A extends number | string>(l: L.List<A>): L.List<A> {
  return L.fromArray(L.toArray(l).sort(comparePrimitive as any));
}

benchmark(
  {
    name: "sort, numbers",
    description: "Sort a list of numbers",
    input: [50, 100, 1000, 5000, 10000, 50000],
    before: n => {
      arr = [];
      for (let i = 0; i < n; ++i) {
        arr.push(i);
      }
      shuffle(arr);
    }
  },
  {
    Ramda: {
      run: () => {
        return R.sort(comparePrimitive, arr).length;
      }
    },
    List: {
      before: _ => {
        l = L.fromArray(arr);
      },
      run: () => {
        return L.sort(l).length;
      }
    },
    "List, old": {
      before: _ => {
        l = Lo.fromArray(arr);
      },
      run: () => {
        return Lo.sort(l).length;
      }
    },
    Array: {
      run: () => {
        return copyArray(arr).sort().length;
      }
    },
    "Array, with comparator": {
      run: () => {
        return copyArray(arr).sort(comparePrimitive).length;
      }
    },
    "Immutable.js": {
      before: _ => {
        imm = List(arr);
      },
      run: () => {
        return imm.sort().length;
      }
    }
  }
);

benchmark(
  {
    name: "sort, stable vs unstable",
    description: "Compares the cost of doing a stable search",
    input: [50, 100, 1000, 5000, 10000, 50000],
    before: n => {
      arr = [];
      for (let i = 0; i < n; ++i) {
        arr.push(i);
      }
      shuffle(arr);
    }
  },
  {
    List: {
      before: _ => {
        l = L.fromArray(arr);
      },
      run: () => {
        return L.sort(l).length; // Uses unstable sort since numbers
      }
    },
    "List, stable": {
      before: _ => {
        l = L.fromArray(arr);
      },
      run: () => {
        return L.sortWith(comparePrimitive, l).length; // Uses stable sort
      }
    },
    "Array#sort": {
      run: () => {
        return copyArray(arr).sort(comparePrimitive).length;
      }
    }
  }
);
