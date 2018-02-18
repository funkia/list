import { benchmark } from "./report";
import * as R from "ramda";
import * as L from "../../dist/index";
import * as Lo from "./list-old/dist/index";
import * as Immutable from "immutable";

let n = 0;

let l;
let lOld;
let immList;
let array;

benchmark(
  {
    name: "iterator",
    description: "Iterate over a sequence with a for-of loop.",
    input: [10, 50, 100, 250, 500, 1000, 5000],
    before: n => {
      l = L.range(0, n);
      lOld = Lo.range(0, n);
      immList = Immutable.Range(0, n).toList();
      array = R.range(0, n);
    }
  },
  {
    List: {
      run: () => {
        var result = 10000;
        for (var cur of l) {
          result = result - cur;
        }
        return result;
      }
    },
    "Old list": {
      run: () => {
        var result = 10000;
        for (var cur of lOld) {
          result = result - cur;
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
    },
    Array: {
      run: () => {
        var result = 10000;
        for (var cur of array) {
          result = result - cur;
        }
        return result;
      }
    }
  }
);
