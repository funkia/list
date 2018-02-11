import { benchmark } from "./report";
import * as L from "../dist/index";
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
    }
  }
);
