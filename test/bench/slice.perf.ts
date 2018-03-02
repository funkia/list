import { benchmark } from "./report";
import * as Immutable from "immutable";
import * as R from "ramda";

import * as L from "../../dist/index";
import * as Lo from "./list-old/dist/index";

let start = 0;
let end = 0;

let l;
let lOld;

benchmark(
  {
    name: "slice",
    description: "Slice 25% off of both ends of a sequence.",
    input: [10, 50, 100, 250, 500, 1000, 5000, 10000]
  },
  {
    List: {
      before: to => {
        l = L.range(0, to);
        start = (to / 4) | 0;
        end = start * 3;
      },
      run: () => {
        const l1 = L.slice(start, end, l);
      }
    },
    "List, old": {
      before: to => {
        l = Lo.range(0, to);
        start = (to / 4) | 0;
        end = start * 3;
      },
      run: () => {
        const l1 = Lo.slice(start, end, l);
      }
    },
    "Immutable.js": {
      before: to => {
        l = Immutable.Range(0, to).toList();
        start = (to / 4) | 0;
        end = start * 3;
      },
      run: () => {
        const l1 = l.slice(start, end);
      }
    },
    "Array#slice": {
      before: to => {
        l = R.range(0, to);
        start = (to / 4) | 0;
        end = start * 3;
      },
      run: () => {
        const l1 = l.slice(start, end);
      }
    }
  }
);
