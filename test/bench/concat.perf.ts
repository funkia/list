import { List } from "immutable";
import * as _ from "lodash";
import * as Finger from "@paldepind/finger-tree";
import { benchmark } from "./report";

import * as L from "../../dist/index";
import * as Lo from "./list-old/dist/index";

let left: any;
let right: any;

benchmark(
  {
    name: "concat",
    description: "Concatenates two sequences of size n.",
    input: [10, 50, 100, 250, 500, 1000, 5000, 10000]
  },
  {
    List: {
      before: n => {
        left = L.range(0, n);
        right = L.range(n, 2 * n);
      },
      run: () => L.concat(left, right)
    },
    "List, old": {
      before: n => {
        left = Lo.range(0, n);
        right = Lo.range(n, 2 * n);
      },
      run: () => Lo.concat(left, right)
    },
    Lodash: {
      before: n => {
        left = _.range(0, n);
        right = _.range(n, 2 * n);
      },
      run: () => _.concat(left, right)
    },
    "Array#concat": {
      before: n => {
        left = _.range(0, n);
        right = _.range(n, 2 * n);
      },
      run: () => left.concat(right)
    },
    "Immutable.js": {
      before: n => {
        left = List(_.range(0, n));
        right = List(_.range(n, 2 * n));
      },
      run: () => left.concat(right)
    },
    Finger: {
      before: n => {
        left = Finger.nil;
        for (let i = 0; i < n; ++i) {
          left = Finger.append(i, left);
        }
        right = Finger.nil;
        for (let i = n; i < 2 * n; ++i) {
          right = Finger.append(i, right);
        }
      },
      run: () => Finger.concat(left, right)
    }
  }
);
