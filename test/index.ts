///<reference path="./../typings/index.d.ts" />
import {assert} from "chai";

import {FingerTree, prepend, append, toArray} from "../finger";

describe("Finger tree", () => {
  it("appends two elements", () => {
    const list = append(1, append(0, undefined));
    assert.deepEqual(toArray(list), [0, 1]);
  });
  it("appends three elements", () => {
    const list = append(2, append(1, append(0, undefined)));
    assert.deepEqual(toArray(list), [0, 1, 2]);
  });
  it("appends six elements", () => {
    const list = append(5, append(4, append(3, append(2, append(1, append(0, undefined))))));
    assert.deepEqual(toArray(list), [0, 1, 2, 3, 4, 5]);
  });
  it("prepends six elements", () => {
    const list = prepend(5, prepend(4, prepend(3, prepend(2, prepend(1, prepend(0, undefined))))));
    assert.deepEqual(toArray(list), [5, 4, 3, 2, 1, 0]);
  });
  it("appends 1000 elements", () => {
    let arr: number[] = [];
    let list: FingerTree<number> = undefined;
    for (let i = 0; i < 1000; ++i) {
      list = append(i, list);
      arr.push(i);
    }
    assert.deepEqual(toArray(list), arr);
  });
});
