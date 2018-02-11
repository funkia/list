import { benchmark } from "./report";
import * as L from "../dist/index";
import * as Lo from "./list-old/dist/index";
import * as Immutable from "immutable";

let n = 0;

let l;
let lOld;
let immList;

benchmark(
  {
    name: "iterator",
    input: [/*10,*/ 20, 60, 70, /*80,120,*/ 200, /*400,*/ 1000, /*2000,*/ 3000],
    before: n => {
      l = L.range(0, n);
      lOld = Lo.range(0, n);
      immList = Immutable.Range(0, n).toList();
    }
  },
  {
    "Old list": {
      run: () => {
        var result = 10000;
        var iterator = lOld[Symbol.iterator]();
        var cur;
        while ((cur = iterator.next()).done === false) {
          result = result - cur.value;
        }
        return result;
      }
    },
    List: {
      run: () => {
        var result = 10000;
        var iterator = l[Symbol.iterator]();
        var cur;
        while ((cur = iterator.next()).done === false) {
          result = result - cur.value;
        }
        return result;
      }
    },
    "Immutable.js": {
      run: () => {
        var result = 10000;
        for (var cur of immList) {
          result = result - cur;
        }
        return result;
      }
    }
  }
);
