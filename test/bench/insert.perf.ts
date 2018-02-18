import { benchmark } from "./report";
import * as Immutable from "immutable";
import * as R from "ramda";
import * as mori from "mori";

import * as L from "../../dist/index";
import * as Lo from "./list-old/dist/index";

let idx = 0;

let l;

benchmark(
  {
    name: "insert",
    description: "Insert an element in the middle of a sequence.",
    input: [10, 50, 100, 250, 500, 1000, 5000, 10000]
  },
  {
    List: {
      before: to => {
        l = L.range(0, to);
        idx = (to / 2) | 0;
      },
      run: () => {
        const l1 = L.insert(idx, 0, l);
      }
    },
    "List, old": {
      before: to => {
        l = Lo.range(0, to);
        idx = (to / 2) | 0;
      },
      run: () => {
        const l1 = Lo.insert(idx, 0, l);
      }
    },
    "Immutable.js": {
      before: to => {
        l = Immutable.Range(0, to).toList();
        idx = (to / 2) | 0;
      },
      run: () => {
        const l1 = l.insert(idx, 0);
      }
    },
    Ramda: {
      before: to => {
        l = R.range(0, to);
        idx = (to / 2) | 0;
      },
      run: () => {
        const l1 = R.insert(idx, 0, l);
      }
    }
  }
);
