import { assert } from "chai";

import { List, empty, concat, nth } from "../src/radix";

function createNumberListAppend(start: number, end: number): List<number> {
  let list = empty();
  for (let i = start; i < end; ++i) {
    list = list.append(i);
  }
  return list;
}

describe("Radix", () => {
  describe("append", () => {
    it("can append small", () => {
      const list = empty().append(1).append(2).append(3).append(4);
      assert.strictEqual(list.nth(0), 1);
      assert.strictEqual(list.nth(1), 2);
      assert.strictEqual(list.nth(2), 3);
      assert.strictEqual(list.nth(3), 4);
    });
    it("can append large", () => {
      let list = empty();
      const size = 10000;
      for (let i = 0; i < size; ++i) {
        list = list.append(i);
      }
      for (let i = 0; i < size; ++i) {
        assert.strictEqual(list.nth(i), i);
      }
    });
  });
  describe("concat", () => {
    const list = empty().append(1).append(2).append(3);
    it("concats empty sides", () => {
      assert.strictEqual(concat(list, empty()), list);
      assert.strictEqual(concat(empty(), list), list);
    });
    it("concats two lists of length 32", () => {
      let l1 = empty();
      let l2 = empty();
      for (let i = 0; i < 32; ++i) {
        l1 = l1.append("1:" + i.toString());
        l2 = l2.append("2:" + i.toString());
      }
      const catenated = concat(l1, l2);
      assert.strictEqual(catenated.size, 64);
    });
    it("concats two list of combined size smaller than 32", () => {
      let l1 = createNumberListAppend(0, 12);
      let l2 = createNumberListAppend(12, 31);
      const catenated = concat(l1, l2);
      assert.strictEqual(catenated.size, 31);
      const end = 31;
      for (let i = 0; i < end; ++i) {
        assert.strictEqual(nth(i, catenated), i);
      }
    });
  });
});
