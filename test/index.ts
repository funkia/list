/// <reference path="./../typings/index.d.ts" />
import {assert} from "chai";
import * as util from "util";

import {FingerTree, prepend, append, toArray, size, get, nil} from "../src/finger";

describe("Finger tree", () => {
  it("appends two elements", () => {
    const list = append(1, append(0, nil));
    assert.deepEqual(toArray(list), [0, 1]);
  });
  it("appends three elements", () => {
    const list = append(2, append(1, append(0, nil)));
    assert.deepEqual(toArray(list), [0, 1, 2]);
  });
  it("appends six elements", () => {
    const list = append(5, append(4, append(3, append(2, append(1, append(0, nil))))));
    assert.deepEqual(toArray(list), [0, 1, 2, 3, 4, 5]);
  });
  it("prepends six elements", () => {
    const list = prepend(5, prepend(4, prepend(3, prepend(2, prepend(1, prepend(0, nil))))));
    assert.deepEqual(toArray(list), [5, 4, 3, 2, 1, 0]);
  });
  it("appends 1000 elements", () => {
    let arr: number[] = [];
    let list: FingerTree<number> = nil;
    for (let i = 0; i < 1000; ++i) {
      list = append(i, list);
      arr.push(i);
    }
    assert.deepEqual(toArray(list), arr);
  });
  it("has proper size", () => {
    const list = prepend(5, prepend(4, prepend(3, prepend(2, prepend(1, prepend(0, nil))))));
    assert.deepEqual(size(list), 6);
  });
  it("can index", () => {
    const list = prepend(5, prepend(4, prepend(3, prepend(2, prepend(1, prepend(0, nil))))));
    // console.log(util.inspect(list, {depth: null}));
    assert.deepEqual(get(0, list), 5);
    assert.deepEqual(get(2, list), 3);
  });
  it("can large index", () => {
    const n = 10000;
    let list: FingerTree<number> = nil;
    for (let i = 0; i < n; ++i) {
      list = append(i, list);
    }
    let arr: number[] = [];
    for (let i = 0; i < n; ++i) {
      arr.push(get(i, list));
    }
    assert.deepEqual(toArray(list), arr);
  });
});
