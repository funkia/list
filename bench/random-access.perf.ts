const shuffle = require("knuth-shuffle").knuthShuffle;

import * as _ from "lodash";

import { benchmark } from "./report";

import { List } from "immutable";
import * as Finger from "../dist/finger";

import * as Benchmark from "benchmark";

import * as L from "../dist/index";
import * as Lo from "./list-old/dist/index";

let n: number;
let list: L.List<number>;
let indices: number[] = [];
let l: any;

benchmark({
  name: "random access",
  input: [10, 10000, 1000000],
  before: (m) => {
    // n = m;
    // for (let i = 0; i < n; ++i) {
    //   indices.push(i);
    // }
    // shuffle(indices);
  }
}, {
    "List, current": {
      before: (m) => {
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
      before: (m) => {
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
    "Array": {
      before: (m) => {
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
    }
  });
