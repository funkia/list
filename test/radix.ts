import { assert } from "chai";

import { List, empty, concat, nth } from "../src/radix";

function createNumberListAppend(start: number, end: number): List<number> {
  let list = empty();
  for (let i = start; i < end; ++i) {
    list = list.append(i);
  }
  return list;
}

function assertIndicesFromTo(
  list: List<number>, from: number, to: number
): void {
  for (let i = from; i < to; ++i) {
    assert.strictEqual(list.nth(i), i);
  }
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
    it("can append 1000 elements", () => {
      let list = empty();
      const size = 1000;
      for (let i = 0; i < size; ++i) {
        list = list.append(i);
      }
      assertIndicesFromTo(list, 0, 1000);
    });
    it("can append 97 elements", () => {
      let list = empty();
      const size = 97;
      for (let i = 0; i < size; ++i) {
        list = list.append(i);
      }
      assertIndicesFromTo(list, 0, 97);
    });
    it("can append tree of depth 2", () => {
      const size = 32 * 32 * 32 + 32;
      const list = createNumberListAppend(0, size);
      assertIndicesFromTo(list, 0, size);
    });
  });
  describe("concat", () => {
    const list = empty().append(1).append(2).append(3);
    it("concats empty sides", () => {
      assert.strictEqual(concat(list, empty()), list);
      assert.strictEqual(concat(empty(), list), list);
    });
    describe("right is smaller than 32", () => {
      it("combined size is smaller than 32", () => {
        let l1 = createNumberListAppend(0, 12);
        let l2 = createNumberListAppend(12, 31);
        const catenated = concat(l1, l2);
        assert.strictEqual(catenated.size, 31);
        const end = 31;
        for (let i = 0; i < end; ++i) {
          assert.strictEqual(nth(i, catenated), i);
        }
      });
      it("left suffix is full", () => {
        [32, 32 * 4, 32 * 5, 32 * 12].forEach((leftSize) => {
          const l1 = createNumberListAppend(0, leftSize);
          const l2 = createNumberListAppend(leftSize, leftSize + 30);
          const catenated = concat(l1, l2);
          assert.strictEqual(catenated.size, leftSize + 30);
          for (let i = 0; i < leftSize + 30; ++i) {
            assert.strictEqual(nth(i, catenated), i);
          }
        });
      });
      it("left is full tree", () => {
        const leftSize = 32 * 32 * 32 + 32;
        const l1 = createNumberListAppend(0, leftSize);
        assertIndicesFromTo(l1, 0, leftSize);
        const l2 = createNumberListAppend(leftSize, leftSize + 30);
        const catenated = concat(l1, l2);
        assert.strictEqual(catenated.size, leftSize + 30);
        assertIndicesFromTo(catenated, 0, leftSize + 30);
      });
      it("left suffix is arbitrary size", () => {
        [70, 183, 1092].forEach((leftSize) => {
          let l1 = createNumberListAppend(0, leftSize);
          let l2 = createNumberListAppend(leftSize, leftSize + 30);
          const catenated = concat(l1, l2);
          assert.strictEqual(catenated.size, leftSize + 30);
          assertIndicesFromTo(catenated, 0, leftSize + 30);
        });
      });
    });
    describe("both are large", () => {
      it("concats properly", () => {
        [[83, 128], [2381, 3720]].forEach(([leftSize, rightSize]) => {
          let l1 = createNumberListAppend(0, leftSize);
          let l2 = createNumberListAppend(leftSize, leftSize + rightSize);
          const catenated = concat(l1, l2);
          assertIndicesFromTo(catenated, 0, leftSize + rightSize);
        });
      });
    });
  });
});
