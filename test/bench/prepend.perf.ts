import { benchmark } from "./report";
import * as L from "../../dist/index";
import * as Lo from "./list-old/dist/index";
import * as _ from "lodash";
import * as Immutable from "immutable";
import * as R from "ramda";
import * as mori from "mori";

let n = 0;

benchmark(
  {
    name: "append",
    description: "Creates a sequence of size n by repeatedly appending.",
    input: [10, 50, 100, 250, 500, 1000, 5000, 10000]
  },
  {
    List: {
      before: nn => {
        n = nn;
      },
      run: () => {
        let list = L.empty();
        for (let i = 0; i < n; ++i) {
          list = list.append(i);
        }
        return list.length === n;
      }
    },
    "Old list": {
      before: nn => {
        n = nn;
      },
      run: () => {
        let list = Lo.empty();
        for (let i = 0; i < n; ++i) {
          list = list.append(i);
        }
        return list.length === n;
      }
    },
    "Immutable.js": {
      before: nn => {
        n = nn;
      },
      run: () => {
        let imm = Immutable.List();
        for (let i = 0; i < n; ++i) {
          imm = imm.push(i);
        }
        return imm.size === n;
      }
    },
    "Ramda": {
      before: nn => {
        n = nn;
      },
      run: () => {
        let arr: number[] = [];
        for (let i = 0; i < n; ++i) {
          arr = R.append(i, arr);
        }
        return arr.length === n;
      }
    },
    "Mori": {
      before: nn => {
        n = nn;
      },
      run: () => {
        let list = mori.vector();
        for (let i = 0; i < n; ++i) {
          list = mori.conj(list, i);
        }
        return mori.count(list);
      }
    }
  }
);

benchmark(
  {
    name: "prepend",
    description: "Creates a sequence of size n by repeatedly prepending.",
    input: [10, 100, 500, 1000]
  },
  {
    List: {
      before: nn => {
        n = nn;
      },
      run: () => {
        let list = L.empty();
        for (let i = 0; i < n; ++i) {
          list = L.prepend(i, list);
        }
        return list.length === n;
      }
    },
    "Old list": {
      before: nn => {
        n = nn;
      },
      run: () => {
        let list = Lo.empty();
        for (let i = 0; i < n; ++i) {
          list = Lo.prepend(i, list);
        }
        return list.length === n;
      }
    }
  }
);
