import { benchmark } from "./report";
import * as Immutable from "immutable";
import * as R from "ramda";
import * as mori from "mori";

import * as L from "../../dist/index";
import * as Lo from "./list-old/dist/index";

let idx1 = 0;
let idx2 = 0;
let idx3 = 0;

let l;
let lOld;

benchmark(
  {
    name: "update",
    input: [10, 100, 500, 1000]
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
        const l1 = L.update(idx1, idx1, l);
        const l2 = L.update(idx2, idx2, l1);
        const l3 = L.update(idx3, idx3, l2);
      }
    },
    "List old": {
      before: to => {
        l = Lo.range(0, to);
        idx1 = (to / 4) | 0;
        idx2 = idx1 * 2;
        idx3 = idx1 * 3;
      },
      run: () => {
        const l1 = Lo.update(idx1, idx1, l);
        const l2 = Lo.update(idx2, idx2, l1);
        const l3 = Lo.update(idx3, idx3, l2);
      }
    },
    Immutable: {
      before: to => {
        l = Immutable.Range(0, to).toList();
        idx1 = (to / 4) | 0;
        idx2 = idx1 * 2;
        idx3 = idx1 * 3;
      },
      run: () => {
        const l1 = l.set(idx1, idx1);
        const l2 = l.set(idx2, idx2);
        const l3 = l.set(idx3, idx2);
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
        const l1 = R.update(idx1, idx1, l);
        const l2 = R.update(idx2, idx2, l1);
        const l3 = R.update(idx3, idx3, l2);
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
        const l1 = mori.assoc(l, idx1, idx1);
        const l2 = mori.assoc(l1, idx2, idx2);
        const l3 = mori.assoc(l2, idx3, idx3);
      }
    }
  }
);