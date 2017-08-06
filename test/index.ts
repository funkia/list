import { assert } from "chai";

import {
  length, range, concat, empty, List, list, map, nth, foldl, foldr,
  last, pair, prepend, append, first, repeat, take, every, some, none,
  find
} from '../src/index';

function numberArray(start: number, end: number): number[] {
  let array = [];
  for (let i = start; i < end; ++i) {
    array.push(i);
  }
  return array;
}

function appendList(start: number, end: number, l = empty()): List<number> {
  for (let i = start; i < end; ++i) {
    l = append(i, l);
  }
  return l;
}

function prependList(start: number, end: number): List<number> {
  let l = empty();
  for (let i = end - 1; i >= start; --i) {
    l = prepend(i, l);
  }
  return l;
}

function assertIndicesFromTo(
  list: List<number>, from: number, to: number
): void {
  for (let i = from; i < to; ++i) {
    assert.strictEqual(nth(i, list), i);
  }
}

const isEven = (n: number) => n % 2 === 0;

describe("List", () => {
  describe("repeat", () => {
    it("creates list of n repeated elements", () => {
      [10, 100].forEach((n) => {
        const l = repeat("foo", n);
        assert.strictEqual(length(l), n);
        for (const value of l) {
          assert.strictEqual(value, "foo");
        }
      });
    });
  });
  describe("append", () => {
    it("can append small", () => {
      const list = empty().append(0).append(1).append(2).append(3);
      assertIndicesFromTo(list, 0, 4);
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
      let l = appendList(0, 97);
      assertIndicesFromTo(l, 0, 97);
    });
    it("can append tree of depth 2", () => {
      const size = 32 * 32 * 32 + 32;
      const list = range(0, size);
      assertIndicesFromTo(list, 0, size);
    });
    it("copies suffix when it should", () => {
      const l1 = append(0, empty());
      const l2 = append(1, l1);
      const l3 = append(2, l1);
      assert.strictEqual(last(l2), 1);
      assert.strictEqual(last(l3), 2);
    });
  });
  describe("prepend", () => {
    it("prepends items", () => {
      [
        32, // everything sits in prefix
        32 + 32 + 1, // tail is pushed down
        32 ** 2 + 32 + 1, // depth is 2 and tail is pushed down
        32 ** 2 + 2 * 32 + 1,
        2081,
        32 ** 3 + 2 * 32 + 1
      ].forEach((n) => {
        let l = empty();
        for (let i = n - 1; i >= 0; --i) {
          l = prepend(i, l);
        }
        assertIndicesFromTo(l, 0, n);
      });
    });
    it("prepends many items", () => {
      [
        32
        // 1048641 // large
      ].forEach((n) => {
        let l = empty();
        for (let i = n - 1; i >= 0; --i) {
          l = prepend(i, l);
        }
        assertIndicesFromTo(l, 0, n);
      });
    });
  });
  describe("append and prepend", () => {
    it("prepend to 32 size appended", () => {
      let l = empty();
      const n = 32;
      for (let i = 1; i < n + 1; ++i) {
        l = append(i, l);
      }
      l = prepend(0, l);
      assertIndicesFromTo(l, 0, n + 1);
    });
    it("can append and prepend", () => {
      let l = empty();
      const n = 1000;
      for (let i = 0; i < n; ++i) {
        l = prepend(n - i - 1, l);
        l = append(n + i, l);
      }
    });
    it("can append when there is offset", () => {
      let l = empty();
      const n = 32 ** 2 + 32 * 2;
      const m = (32 ** 2); // * 31 - 32 * 3;
      const nm = 33;
      // first we prepend enough elements to grow the tree to height
      // 2, then we push additionally 64 elements to arrive at a list
      // with an offset
      for (let i = n - 1; i >= 0; --i) {
        l = prepend(i + nm, l);
      }
      // next we append elements to fill the right space up
      for (let i = 0; i < m; ++i) {
        l = append(n + nm + i, l);
      }
      // finally we push enough elements to trigger one more prefix to
      // be pushed down
      for (let i = nm - 1; 0 <= i; --i) {
        l = prepend(i, l);
      }
      assertIndicesFromTo(l, 0, n + m + nm);
    });
  });
  describe("list", () => {
    it("creates a list with the given elements", () => {
      const l = list(0, 1, 2, 3);
      assertIndicesFromTo(l, 0, 4);
    });
  });
  describe("pair", () => {
    it("creates a list of two elements", () => {
      const p = pair("foo", "bar");
      assert.strictEqual(length(p), 2);
      assert.strictEqual(nth(0, p), "foo");
      assert.strictEqual(nth(1, p), "bar");
    });
  });
  describe("first and last", () => {
    it("gets the last element of a short list", () => {
      assert.strictEqual(last(list(0, 1, 2, 3)), 3);
    });
    it("gets the last element of a long list", () => {
      assert.strictEqual(last(appendList(0, 100)), 99);
    });
    it("can get the last element when prefix overflows", () => {
      assert.strictEqual(last(prependList(0, 33)), 32);
    });
    it("returns undefined on empty list", () => {
      assert.strictEqual(last(list()), undefined);
    });
    it("gets the last element of prepended list", () => {
      const l = prepend(0, prepend(1, prepend(2, empty())));
      assert.strictEqual(last(l), 2);
    });
    it("gets first element of prepended list", () => {
      const l = prepend(0, prepend(1, prepend(2, empty())));
      assert.strictEqual(first(l), 0);
    });
    it("gets first element of appended list", () => {
      const l = append(3, append(2, append(1, append(0, empty()))));
      assert.strictEqual(first(l), 0);
    });
    it("can get the first element when suffix overflows", () => {
      assert.strictEqual(first(appendList(0, 33)), 0);
    });
  });
  describe("concat", () => {
    const l = empty().append(1).append(2).append(3);
    it("concats empty sides", () => {
      assert.strictEqual(concat(l, empty()), l);
      assert.strictEqual(concat(empty(), l), l);
    });
    describe("right is small", () => {
      it("combined suffix size is smaller than 32", () => {
        let l1 = appendList(0, 12);
        let l2 = appendList(12, 31);
        const catenated = concat(l1, l2);
        assert.strictEqual(length(catenated), 31);
        assertIndicesFromTo(catenated, 0, 31);
      });
      it("right has prefix and suffix that can be combined", () => {
        let l1 = appendList(0, 12);
        let l2 = append(16, append(15, prepend(12, prepend(13, prepend(14, empty())))));
        const concatenated = concat(l1, l2);
        assert.strictEqual(length(concatenated), 17);
        assertIndicesFromTo(concatenated, 0, 17);
      });
      it("affixes takes up 3 affixes when combined", () => {
        let l1 = appendList(0, 30);
        let l2 = appendList(60, 90, prependList(30, 60));
        const concatenated = concat(l1, l2);
        assert.strictEqual(length(concatenated), 90);
        assertIndicesFromTo(concatenated, 0, 90);
      });
      it("left suffix is full", () => {
        [32, 32 * 4, 32 * 5, 32 * 12].forEach((leftSize) => {
          const l1 = appendList(0, leftSize);
          const l2 = appendList(leftSize, leftSize + 30);
          const catenated = concat(l1, l2);
          assert.strictEqual(catenated.length, leftSize + 30);
          for (let i = 0; i < leftSize + 30; ++i) {
            assert.strictEqual(nth(i, catenated), i);
          }
        });
      });
      it("left is full tree", () => {
        const leftSize = 32 * 32 * 32 + 32;
        const l1 = appendList(0, leftSize);
        assertIndicesFromTo(l1, 0, leftSize);
        const l2 = appendList(leftSize, leftSize + 30);
        const catenated = concat(l1, l2);
        assert.strictEqual(catenated.length, leftSize + 30);
        assertIndicesFromTo(catenated, 0, leftSize + 30);
      });
      it("left suffix is arbitrary size", () => {
        [70, 183, 1092].forEach((leftSize) => {
          const l1 = appendList(0, leftSize);
          const l2 = appendList(leftSize, leftSize + 30);
          const catenated = concat(l1, l2);
          assert.strictEqual(catenated.length, leftSize + 30);
          assertIndicesFromTo(catenated, 0, leftSize + 30);
        });
      });
      it("both left and right has prefix and suffix", () => {
        [[40, 33]].forEach(([leftSize, rightSize]) => {
          const l1 = appendList(0, leftSize);
          const l2 = appendList(leftSize, leftSize + rightSize);
          const catenated = concat(l1, l2);
          assertIndicesFromTo(catenated, 0, leftSize + rightSize);
        });
      });
      it("node has to be pushed down without room for it", () => {
        [[32 * 2 + 1, 32]].forEach(([leftSize, rightSize]) => {
          const l1 = appendList(0, leftSize);
          const l2 = appendList(leftSize, leftSize + rightSize);
          const catenated = concat(l1, l2);
          assertIndicesFromTo(catenated, 0, leftSize + rightSize);
        });
      });
    });
    describe("both are large", () => {
      it("concats once properly", () => {
        [[83, 128], [2381, 3720]].forEach(([leftSize, rightSize]) => {
          const l1 = appendList(0, leftSize);
          const l2 = appendList(leftSize, leftSize + rightSize);
          const catenated = concat(l1, l2);
          assertIndicesFromTo(catenated, 0, leftSize + rightSize);
        });
      });
      it("does balancing", () => {
        const size = 4 * 32 + 1;
        const firstSize = 5 * 32 + 1;
        const secondSize = 5 * 32 + 1;
        const thirdSize = 5 * 32 + 1;
        const totalSize = firstSize + secondSize + thirdSize;
        const l1 = appendList(0, size * 1);
        const l2 = appendList(size * 1, size * 2);
        const l3 = appendList(size * 2, size * 3);
        const l4 = appendList(size * 3, size * 4);
        const l5 = appendList(size * 4, size * 5);
        const catenated = concat(concat(concat(concat(l1, l2), l3), l4), l5);
        assert.strictEqual(catenated.length, size * 5);
        assertIndicesFromTo(catenated, 0, totalSize + size);
      });
    });
  });
  describe("monoid", () => {
    it("has fantasy land empty", () => {
      list(0, 1, 2)["fantasy-land/empty"]();
    });
    it("has fantasy land concat", () => {
      list(0, 1, 2)["fantasy-land/concat"](list(3, 4));
    });
  });
  describe("map", () => {
    const square = (n: any) => n * n;
    it("maps function over list", () => {
      [30, 100, 32 * 4 + 1].forEach((n) => {
        const l = range(0, n);
        const mapped = map(square, l);
        for (let i = 0; i < n; ++i) {
          assert.strictEqual(nth(i, mapped), i * i);
        }
      });
    });
    it("maps over prepended list", () => {
      const l = prependList(0, 50);
      const mapped = map(square, l);
      for (let i = 0; i < 50; ++i) {
        assert.strictEqual(nth(i, mapped), i * i);
      }
    });
    it("has Fantasy Land method", () => {
      const n = 50;
      const l = range(0, n);
      const mapped = l["fantasy-land/map"]((m) => m * m);
      for (let i = 0; i < n; ++i) {
        assert.strictEqual(nth(i, mapped), i * i);
      }
    });
  });
  describe("fold", () => {
    const subtract = (n: number, m: number) => n - m;
    it("folds from the left appended", () => {
      [10, 32 * 4 + 5].forEach((n) => {
        const result = foldl((arr, i) => (arr.push(i), arr), [], prependList(0, n));
        const a = foldl((n, m) => n - m, 1, list(2, 3, 4, 5));
        const b = foldr((n, m) => n - m, 5, list(1, 2, 3, 4));
        assert.deepEqual(result, numberArray(0, n));
      });
    });
    it("folds from the left prepended", () => {
      [10, 32 * 4 + 5].forEach((n) => {
        const result = foldl((arr, i) => (arr.push(i), arr), [], prependList(0, n));
        assert.deepEqual(result, numberArray(0, n));
      });
    });
    it("folds from the right appended", () => {
      [10, 32 * 4 + 5].forEach((n) => {
        const result = foldr((i, arr) => (arr.push(i), arr), [], appendList(0, n));
        assert.deepEqual(result, numberArray(0, n).reverse());
      });
    });
    it("folds from the right prepended", () => {
      [10, 32 * 4 + 5].forEach((n) => {
        const result = foldr((i, arr) => (arr.push(i), arr), [], prependList(0, n));
        assert.deepEqual(result, numberArray(0, n).reverse());
      });
    });
  });
  describe("take", () => {
    it("takes element from the left", () => {
      ([
        [10, 20, true], // we only take from suffix
        [10, 32 * 3, false], // we should only take from prefix
        [100, 1000, true], // stop in tree
        [999, 1000, true]
      ] as [number, number, boolean][]).forEach(([amount, n, shouldAppend]) => {
        const l = shouldAppend ? appendList(0, n) : prependList(0, n);
        const taken = take(amount, l);
        assert.strictEqual(taken.length, amount);
        assertIndicesFromTo(l, 0, amount);
      });
    });
    it("returns same list when taking more than length", () => {
      [[10, 10], [12, 9]].forEach(([amount, n]) => {
        const l = appendList(0, n);
        const taken = take(amount, l);
        assert.strictEqual(l, taken);
      });
    });
  });
  describe("every, some, and none", () => {
    const l1 = list(2, 4, 6, 8);
    const l2 = list(2, 3, 4, 6, 7, 8);
    const l3 = list(1, 3, 5, 7);
    it("returns true from every when all elements satisfy predicate", () => {
      assert.strictEqual(every(isEven, empty()), true);
      assert.strictEqual(every(isEven, l1), true);
      assert.strictEqual(every(isEven, l2), false);
      assert.strictEqual(every(isEven, l3), false);
    });
    it("returns true from every when all elements satisfy predicate", () => {
      assert.strictEqual(some(isEven, empty()), false);
      assert.strictEqual(some(isEven, l1), true);
      assert.strictEqual(some(isEven, l2), true);
      assert.strictEqual(some(isEven, l3), false);
    });
    it("returns true from every when all elements satisfy predicate", () => {
      assert.strictEqual(none(isEven, empty()), true);
      assert.strictEqual(none(isEven, l1), false);
      assert.strictEqual(none(isEven, l2), false);
      assert.strictEqual(none(isEven, l3), true);
    });
  });
  describe("find", () => {
    it("finds the first element satisfying predicate", () => {
      assert.strictEqual(find(isEven, list(1, 3, 4, 5, 6)), 4);
    });
    it("returns undefined if no element is found", () => {
      assert.strictEqual(find(isEven, list(1, 3, 5, 7)), undefined);
    });
  });
  describe("iteration", () => {
    it("iterates over leftwise dense list", () => {
      [
        20, // a list where there is no elements in tree
        1000, // a tree with larger depth,
        32 ** 2 + 3 // an even larger tree
      ].forEach((n) => {
        const l = range(0, n);
        let last = -1;
        for (const element of l) {
          assert.strictEqual(element, last + 1);
          last = element;
        }
        assert.strictEqual(last, n - 1);
      });
    });
  });
});
