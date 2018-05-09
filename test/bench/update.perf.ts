import { benchmark } from "./report";
import * as Immutable from "immutable";
import * as R from "ramda";
import * as mori from "mori";

import * as L from "../../dist/index";
import * as Lo from "./list-old/dist/index";

let idx1 = 0;
let idx2 = 0;
let idx3 = 0;

let l: any;

benchmark(
  {
    name: "update",
    description:
      "Update elements at location 0.25, 0.5, and 0.75 i a sequence.",
    input: [10, 50, 100, 250, 500, 1000, 5000, 10000]
  },
  {
    List: {
      before: to => {
        l = L.range(0, to);
        idx1 = (to / 4) | 0;
        idx2 = idx1 * 2;
        idx3 = idx1 * 3;
      },
      run: () => {
        const l1 = L.update(idx1, 0, l);
        const l2 = L.update(idx2, 0, l1);
        const l3 = L.update(idx3, 0, l2);
      }
    },
    "List, old": {
      before: to => {
        l = Lo.range(0, to);
        idx1 = (to / 4) | 0;
        idx2 = idx1 * 2;
        idx3 = idx1 * 3;
      },
      run: () => {
        const l1 = Lo.update(idx1, 0, l);
        const l2 = Lo.update(idx2, 0, l1);
        const l3 = Lo.update(idx3, 0, l2);
      }
    },
    "Immutable.js": {
      before: to => {
        l = Immutable.Range(0, to).toList();
        idx1 = (to / 4) | 0;
        idx2 = idx1 * 2;
        idx3 = idx1 * 3;
      },
      run: () => {
        const l1 = l.set(idx1, 0);
        const l2 = l1.set(idx2, 0);
        const l3 = l2.set(idx3, 0);
      }
    },
    Ramda: {
      before: to => {
        l = R.range(0, to);
        idx1 = (to / 4) | 0;
        idx2 = idx1 * 2;
        idx3 = idx1 * 3;
      },
      run: () => {
        const l1 = R.update(idx1, 0, l);
        const l2 = R.update(idx2, 0, l1);
        const l3 = R.update(idx3, 0, l2);
      }
    },
    mori: {
      before: to => {
        l = mori.vector();
        for (let i = 0; i < to; ++i) {
          l = mori.conj(l, i);
        }
        idx1 = (to / 4) | 0;
        idx2 = idx1 * 2;
        idx3 = idx1 * 3;
      },
      run: () => {
        const l1 = mori.assoc(l, idx1, 0);
        const l2 = mori.assoc(l1, idx2, 0);
        const l3 = mori.assoc(l2, idx3, 0);
      }
    }
  }
);
