const shuffle = require("knuth-shuffle").knuthShuffle;

import * as _ from "lodash";

import { benchmark } from "./report";

import { List } from "immutable";
import * as Finger from "@paldepind/finger-tree";

import * as Benchmark from "benchmark";

import * as L from "../dist/index";
import * as Lo from "./list-old/dist/index";

let n: number;
let list: L.List<number>;
let indices: number[] = [];
let l: any;
let imm: any;

benchmark(
  {
    name: "random access",
    input: [50, 100, 1000, 5000, 10000],
    before: m => {
      // n = m;
      // for (let i = 0; i < n; ++i) {
      //   indices.push(i);
      // }
      // shuffle(indices);
    }
  },
  {
    "List, current": {
      before: m => {
        n = m;
        l = L.empty();
        for (let i = 0; i < n; ++i) {
          l = L.append(i, l);
        }
      },
      run: () => {
        let sum = 0;
        for (let i = 0; i < n; ++i) {
          sum += l.nth(i);
        }
        return sum;
      }
    },
    "List, old": {
      before: m => {
        n = m;
        l = Lo.empty();
        for (let i = 0; i < n; ++i) {
          l = Lo.append(i, l);
        }
      },
      run: () => {
        let sum = 0;
        for (let i = 0; i < n; ++i) {
          sum += l.nth(i);
        }
        return sum;
      }
    },
    Array: {
      before: m => {
        n = m;
        l = [];
        for (let i = 0; i < n; ++i) {
          l.push(i);
        }
      },
      run: () => {
        let sum = 0;
        for (let i = 0; i < n; ++i) {
          sum += l[i];
        }
        return sum;
      }
    },
    "Immutable.js": {
      before: m => {
        n = m;
        imm = List();
        for (let i = 0; i < n; ++i) {
          imm = imm.push(i);
        }
      },
      run: () => {
        let sum = 0;
        for (let i = 0; i < n; ++i) {
          sum += imm.get(i);
        }
        return sum;
      }
    }
  }
);
