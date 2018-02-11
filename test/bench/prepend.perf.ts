import { benchmark } from "./report";
import * as L from "../dist/index";
import * as Lo from "./list-old/dist/index";

let n = 0;

benchmark(
  {
    name: "append",
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
    }
  }
);

benchmark(
  {
    name: "prepend",
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
