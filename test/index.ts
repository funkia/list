import { assert } from "chai";

import * as P from "proptest";

import { checkList, installCheck } from "./check";
import * as Loriginal from "../src";

const L: typeof Loriginal = installCheck(Loriginal);

import {
  length,
  range,
  concat,
  empty,
  List,
  list,
  map,
  nth,
  foldl,
  foldr,
  last,
  pair,
  prepend,
  append,
  first,
  repeat,
  times,
  take,
  every,
  some,
  splitAt,
  none,
  find,
  findIndex,
  update,
  adjust,
  includes,
  tail,
  pop,
  drop,
  dropLast,
  takeLast,
  filter,
  reject,
  join,
  takeWhile,
  toArray,
  fromArray,
  dropWhile,
  flatten,
  pluck,
  indexOf,
  equals,
  remove,
  fromIterable,
  partition,
  insert,
  insertAll,
  chain,
  of,
  ap,
  reverse,
  forEach
} from "../src";

const check = P.createProperty(it);

// Generates a list with length between 0 and size
const genList = P.nat.map(n => range(0, n));

// Generates a list with length in the full 32 integer range
const genBigList = P.between(0, 10000).map(n => range(0, n));

function numberArray(start: number, end: number): number[] {
  let array = [];
  for (let i = start; i < end; ++i) {
    array.push(i);
  }
  return array;
}

function appendList(
  start: number,
  end: number,
  l: List<number> = empty()
): List<number> {
  for (let i = start; i < end; ++i) {
    l = append(i, l);
  }
  return l;
}

function prependList(
  start: number,
  end: number,
  l: List<number> = empty()
): List<number> {
  for (let i = end - 1; i >= start; --i) {
    l = prepend(i, l);
  }
  return l;
}

function assertIndicesFromTo(
  list: List<number>,
  from: number,
  to: number,
  offset: number = 0
): void {
  for (let i = 0; i < to - from; ++i) {
    let elm: number;
    try {
      elm = nth(i + offset, list)!;
    } catch (err) {
      throw new Error(`Error while indexing ${i + offset}\n${err}`);
    }
    assert.strictEqual(elm, from + i);
  }
}

function cheapAssertIndicesFromTo(
  list: List<number>,
  from: number,
  to: number
): void {
  const length = to - from;
  if (length > 100) {
    assertIndicesFromTo(list, from, from + 50);
    assertIndicesFromTo(list, to - 50, to, length - 50);
    const middle = Math.floor(length / 2);
    assertIndicesFromTo(list, from + middle, from + middle + 1, middle);
  } else {
    assertIndicesFromTo(list, from, to);
  }
}

function assertIndexEqual<A>(i: number, l1: List<A>, l2: List<A>): void {
  assert.deepEqual(nth(i, l1), nth(i, l2), `expected equality at index ${i}`);
}

export function assertListEqual<A>(l1: List<A>, l2: List<A>): void {
  assert.equal(l1.length, l2.length, "same length");
  const length = l1.length;
  if (length > 500) {
    // If the list is long we cheap out
    for (let i = 0; i < 100; ++i) {
      assertIndexEqual(i, l1, l2);
    }
    const first = (length * 0.25) | 0;
    const middle = (length * 0.5) | 0;
    const third = (length * 0.75) | 0;
    assertIndexEqual(first, l1, l2);
    assertIndexEqual(middle, l1, l2);
    assertIndexEqual(third, l1, l2);
    for (let i = l1.length - 100; i < l1.length; ++i) {
      assertIndexEqual(i, l1, l2);
    }
  } else {
    for (let i = 0; i < l1.length; ++i) {
      assertIndexEqual(i, l1, l2);
    }
  }
}

const isEven = (n: number) => n % 2 === 0;

const square = (n: number) => n * n;

const sum = (a: number, b: number) => a + b;

describe("List", () => {
  describe("repeat", () => {
    it("creates list of n repeated elements", () => {
      [10, 100].forEach(n => {
        const l = repeat("foo", n);
        assert.strictEqual(length(l), n);
        for (const value of l) {
          assert.strictEqual(value, "foo");
        }
      });
    });
  });
  describe("times", () => {
    it("creates list of n elements repeating a fonction n times", () => {
      const l = times(n => n * n, 4);
      assert.isTrue(equals(l, list(0, 1, 4, 9)));
    });
  });
  describe("append", () => {
    it("can append small", () => {
      const list = appendList(0, 4);
      assertIndicesFromTo(list, 0, 4);
    });
    it("can append 1000 elements", () => {
      const l = appendList(0, 1000);
      assertIndicesFromTo(l, 0, 1000);
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
    it("should work with size tables", () => {
      const size = 32 * 5 + 1;
      const list1 = concat(appendList(0, size), appendList(size, size * 2));
      const list2 = appendList(size * 2, size * 3, list1);
      assertIndicesFromTo(list2, 0, size * 3);
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
      ].forEach(n => {
        let l = empty();
        for (let i = n - 1; i >= 0; --i) {
          l = L.prepend(i, l);
        }
        assertIndicesFromTo(l, 0, n);
      });
    });
    it("prepends many items", () => {
      [
        32
        // 1048641 // large
      ].forEach(n => {
        let l = empty();
        for (let i = n - 1; i >= 0; --i) {
          l = L.prepend(i, l);
        }
        assertIndicesFromTo(l, 0, n);
      });
    });
    it("should work with size tables", () => {
      // Attempt prepending to a list that has size-tables from
      // concatenation
      const size = 32 * 5 + 1;
      const list1 = concat(
        appendList(size, size * 2),
        appendList(size * 2, size * 3)
      );
      const list2 = prependList(0, size, list1);
      assertIndicesFromTo(list2, 0, size * 3);
    });
    it("properly fills up a tree of depth one that has size tables", () => {
      const prependSize = 1000;
      const size = 65;

      const list = prependList(prependSize, prependSize + size);
      const list2 = prependList(prependSize + size, prependSize + size + size);

      const concatenated = concat(list, list2);
      const final = prependList(0, prependSize, concatenated);

      assertIndicesFromTo(final, 0, prependSize + size + size);
    });
    it("should work with two levels of size tables", () => {
      const size = 32 * 10 + 1;
      const l1 = appendList(size * 1, size * 2);
      const l2 = appendList(size * 2, size * 3);
      const l3 = appendList(size * 3, size * 4);
      const l4 = appendList(size * 4, size * 5);
      const l5 = appendList(size * 5, size * 6);
      const catenated = concat(concat(concat(concat(l1, l2), l3), l4), l5);
      const final = prependList(0, size, catenated);
      assertIndicesFromTo(final, 0, size * 6);
    });
    it("correctly uses offset when prepending in the presence of size tables", () => {
      // This test ensures that prepending to a list with size-tables
      // works correctly. In the test the height of the tree will be
      // increased when prepending. This introduces a non-zero offset.
      // The additional prepends fills up this offset.
      const prependSize = 1259;
      const size = 405;
      const list1 = prependList(prependSize, prependSize + size);
      const list2 = prependList(prependSize + size, prependSize + 2 * size);
      const concatenated = concat(list1, list2);
      const final = prependList(0, prependSize, concatenated);
      assertIndicesFromTo(final, 0, prependSize + 2 * size);
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
      const m = 32 ** 2; // * 31 - 32 * 3;
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
  describe("nth", () => {
    it("returns undefined on -1 and empyt list", () => {
      assert.strictEqual(L.nth(-1, L.empty()), undefined);
    });
  });
  describe("list", () => {
    it("creates a list with the given elements", () => {
      const l = list(0, 1, 2, 3);
      assertIndicesFromTo(l, 0, 4);
    });
  });
  describe("of", () => {
    it("creates a singleton", () => {
      const l = of("foo");
      assert.strictEqual(l.length, 1);
      assert.strictEqual(nth(0, l), "foo");
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
      assert.strictEqual(last(list("a", "b", "c", "d")), "d");
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
    check("has left identity", genList, l => {
      assertListEqual(concat(empty(), l), l);
      return true;
    });
    check("has right identity", genList, l => {
      assertListEqual(concat(l, empty()), l);
      return true;
    });
    check(
      "is associative",
      P.three(P.range(1_000_000).map(n => range(0, n / 3))),
      ([xs, ys, zs]) => {
        const lhs = concat(xs, concat(ys, zs));
        const rhs = concat(concat(xs, ys), zs);
        assertListEqual(lhs, rhs);
        return true;
      },
      { tests: 10 }
    );
    it("is associative on concrete examples", () => {
      const xs = list(0);
      const ys = append(0, append(0, append(1, repeat(0, 30))));
      const zs = repeat(0, 31);
      const lhs = concat(xs, concat(ys, zs));
      const rhs = concat(concat(xs, ys), zs);
      assert.isTrue(equals(lhs, rhs));
    });
    it("concats empty sides", () => {
      const l = appendList(0, 4);
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
        let l2 = append(
          16,
          append(15, prepend(12, prepend(13, prepend(14, empty()))))
        );
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
        [32, 32 * 4, 32 * 5, 32 * 12].forEach(leftSize => {
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
      }).timeout(5000);
      it("left suffix is arbitrary size", () => {
        [70, 183, 1092].forEach(leftSize => {
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
    describe("satisfies invariant 1", () => {
      it("left nor right has root", () => {
        const left = appendList(0, 32);
        const right = appendList(32, 32 * 2);
        const catenated = concat(left, right);
        assertIndicesFromTo(catenated, 0, left.length + right.length);
        // first relies on the invariant
        assert.strictEqual(first(catenated), 0);
      });
      it("left is only suffix and right has root", () => {
        const left = appendList(0, 32);
        const right = appendList(32, 32 + 32 * 3);
        const catenated = concat(left, right);
        assertIndicesFromTo(catenated, 0, left.length + right.length);
        // first relies on the invariant
        assert.strictEqual(first(catenated), 0);
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
        const l1 = appendList(0, size * 1);
        const l2 = appendList(size * 1, size * 2);
        const l3 = appendList(size * 2, size * 3);
        const l4 = appendList(size * 3, size * 4);
        const l5 = appendList(size * 4, size * 5);
        const catenated = concat(concat(concat(concat(l1, l2), l3), l4), l5);
        assert.strictEqual(catenated.length, size * 5);
        assertIndicesFromTo(catenated, 0, size * 5);
      });
      it("does balancing on trees that are three levels deep", () => {
        // this test hits the case where balancing takes place not at
        // the root and where the balanced nodes fits inside a single
        // parent node. I.e. after balancing there are <= 32 nodes.
        //
        // `l1` will be one level deeper than `l2`. And `l2` fits
        // inside the right most branch of the tree in `l1`, Thus when
        // rebalancing happens the balanced nodes fits in a single
        // leaf.
        const size1 = 32 ** 3 - 32 * 13;
        const size2 = 32 * 15;
        const l1 = appendList(0, size1);
        const l2 = appendList(size1, size1 + size2);
        const catenated = concat(l1, l2);
        assert.strictEqual(catenated.length, size1 + size2);
        assertIndicesFromTo(catenated, 0, size1 + size2);
      });
      it("does balancing when right is largest", () => {
        const size1 = 32 * 15;
        const size2 = 32 ** 3 - 32 * 13;
        const l1 = appendList(0, size1);
        const l2 = appendList(size1, size1 + size2);
        const catenated = concat(l1, l2);
        assert.strictEqual(catenated.length, size1 + size2);
        assertIndicesFromTo(catenated, 0, size1 + size2);
      });
      it("balances when concating 5 large lists", () => {
        const sizes = [17509, 19454, 13081, 16115, 21764];
        let sum = 0;
        let l = empty();
        for (const size of sizes) {
          const list2 = appendList(sum, sum + size);
          sum += size;
          l = concat(l, list2);
        }
        assertIndicesFromTo(l, 0, sum);
      });
      it("inserts tail when path must be created", () => {
        // The right side will have to be inserted as a tail. Parts of
        // the path to the tail location does not exist so it must be
        // created.
        const sizes = [7202, 32];
        let sum = 0;
        let l = empty();
        for (const size of sizes) {
          const list2 = appendList(sum, sum + size);
          sum += size;
          l = concat(l, list2);
        }
        assertIndicesFromTo(l, 0, sum);
      });
      it("updates size tables when pushing down tail", () => {
        // The right side will have to be inserted as a tail. Nodes
        // must be copied down to where the tail is inserted and the
        // nodes have size tables that must be updated accordingly.
        const sizes = [9972, 273, 12315];
        let sum = 0;
        let l = empty();
        for (const size of sizes) {
          const list2 = appendList(sum, sum + size);
          sum += size;
          l = concat(l, list2);
        }
        assertIndicesFromTo(l, 0, sum);
      });
    });
    check(
      "toArray distributes over concat",
      P.between(0, 1000000).replicate(2),
      ([n, m]) => {
        const left = L.range(0, n);
        const right = L.range(n, n + m);
        assert.deepEqual(
          L.toArray(left).concat(L.toArray(right)),
          L.toArray(L.concat(left, right))
        );
        return true;
      },
      { tests: 10 }
    );
  });
  describe("map", () => {
    it("maps function over list", () => {
      [30, 100, 32 * 4 + 1].forEach(n => {
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
  });
  describe("pluck", () => {
    it("gets properties from objects", () => {
      const l = list(
        { foo: 0, bar: "a" },
        { foo: 1, bar: "b" },
        { foo: 2, bar: "c" },
        { foo: 3, bar: "d" }
      );
      const plucked = pluck("foo", l);
      assert.strictEqual(plucked.length, 4);
      assertIndicesFromTo(plucked, 0, 4);
    });
  });
  describe("applicative", () => {
    it("ap", () => {
      const l = ap(
        list((n: number) => n + 2, (n: number) => 2 * n, (n: number) => n * n),
        list(1, 2, 3)
      );
      assert.isTrue(equals(l, list(3, 4, 5, 2, 4, 6, 1, 4, 9)));
    });
  });
  describe("monad", () => {
    it("flattens lists", () => {
      const nested = list(
        list(0, 1, 2, 3),
        list(4),
        empty(),
        list(5, 6, 7, 8, 9)
      );
      const flattened = flatten(nested);
      assert.strictEqual(flattened.length, 10);
      assertIndicesFromTo(flattened, 0, 10);
    });
    it("has chain", () => {
      const l = list(1, 2, 3);
      const l2 = chain(n => list(n, 2 * n, n * n), l);
      assert.isTrue(equals(l2, list(1, 2, 1, 2, 4, 4, 3, 6, 9)));
    });
  });
  describe("fold", () => {
    it("folds from the left appended", () => {
      [10, 32 * 4 + 5].forEach(n => {
        const result = foldl(
          (arr, i) => (arr.push(i), arr),
          <number[]>[],
          prependList(0, n)
        );
        assert.deepEqual(result, numberArray(0, n));
      });
    });
    it("folds from the left prepended", () => {
      [10, 32 * 4 + 5].forEach(n => {
        const result = foldl(
          (arr, i) => (arr.push(i), arr),
          <number[]>[],
          prependList(0, n)
        );
        assert.deepEqual(result, numberArray(0, n));
      });
    });
    it("folds from the right appended", () => {
      [10, 32 * 4 + 5].forEach(n => {
        const result = foldr(
          (i, arr) => (arr.push(i), arr),
          <number[]>[],
          appendList(0, n)
        );
        assert.deepEqual(result, numberArray(0, n).reverse());
      });
    });
    it("folds from the right prepended", () => {
      [10, 32 * 4 + 5].forEach(n => {
        const result = foldr(
          (i, arr) => (arr.push(i), arr),
          <number[]>[],
          prependList(0, n)
        );
        assert.deepEqual(result, numberArray(0, n).reverse());
      });
    });
  });
  describe("scan", () => {
    it("accumulates results", () => {
      const l = list(1, 3, 5, 4, 2);
      const l2 = L.scan((n, m) => n + m, 0, l);
      assertListEqual(l2, list(0, 1, 4, 9, 13, 15));
    });
    it("can change type", () => {
      const l = list(1, 3, 5, 4, 2);
      const l2 = L.scan((s, m) => s + m.toString(), "", l);
      assertListEqual(l2, list("", "1", "13", "135", "1354", "13542"));
    });
  });
  describe("forEach", () => {
    it("calls function for each element", () => {
      const arr: number[] = [];
      forEach(element => arr.push(element), list(0, 1, 2, 3, 4));
      assert.deepEqual(arr, [0, 1, 2, 3, 4]);
    });
  });
  describe("filter and reject", () => {
    it("filters element", () => {
      const l1 = list(0, 1, 2, 3, 4, 5, 6);
      const l2 = filter(isEven, l1);
      assert.strictEqual(length(l2), 4);
      for (let i = 0; i < length(l2); ++i) {
        assert.isTrue(isEven(nth(i, l2)!), `${i} is ${nth(i, l2)}`);
      }
    });
    it("works with user-defined type guards", () => {
      function pred(a: any): a is string {
        return typeof a === "string";
      }
      const l = L.list<number | string>(0, "one", 2, "three", 4, "five");
      const l2 = L.filter(pred, l);
      const l3 = L.map(s => s[0], l2);
      assertListEqual(l3, L.list("o", "t", "f"));
    });
    it("rejects element", () => {
      const l1 = list(0, 1, 2, 3, 4, 5, 6);
      const l2 = reject(isEven, l1);
      assert.strictEqual(length(l2), 3);
      for (let i = 0; i < length(l2); ++i) {
        assert.isFalse(isEven(nth(i, l2)!), `${i} is ${nth(i, l2)}`);
      }
    });
    it("partitions elements in two lists", () => {
      const l = partition(isEven, list(0, 1, 2, 3, 4, 5));
      assert.isTrue(equals(nth(0, l)!, list(0, 2, 4)));
      assert.isTrue(equals(nth(1, l)!, list(1, 3, 5)));
    });
  });
  describe("foldl based functions", () => {
    it("join", () => {
      const s = join(", ", list("one", "two", "three"));
      assert.equal(s, "one, two, three");
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
    it("finds the index of the first element satisfying predicate", () => {
      assert.strictEqual(findIndex(isEven, list(1, 3, 4, 5, 6)), 2);
    });
    it("returns undefined if no element is found", () => {
      assert.strictEqual(findIndex(isEven, list(1, 3, 5, 7)), -1);
    });
    // The tests below ensures that all cases in the internal `foldCb`
    // are being tested
    const l = appendList(0, 32 * 3);
    it("finds in prefix", () => {
      const result = find(n => n === 20, l);
      assert.strictEqual(result, 20);
    });
    it("finds in tree", () => {
      const result = find(n => n === 32 + 4, l);
      assert.strictEqual(result, 32 + 4);
    });
    it("finds in suffix", () => {
      const result = find(n => n === 32 * 2 + 4, l);
      assert.strictEqual(result, 32 * 2 + 4);
    });
    it("finds in deep tree", () => {
      const l2 = appendList(0, 1500 * 6);
      const result = find(n => n % 1500 === 0 && n !== 0 && n !== 1500, l2);
      assert.strictEqual(result, 1500 * 2);
    });
  });
  describe("indexOf", () => {
    const l = list(12, 4, 2, 89, 6, 18, 7);
    it("finds element by strict equality", () => {
      assert.strictEqual(indexOf(89, l), 3);
      assert.strictEqual(indexOf(7, l), 6);
      assert.strictEqual(indexOf(12, l), 0);
    });
    it("return -1 if no element is found", () => {
      assert.strictEqual(indexOf(10, l), -1);
    });
  });
  describe("contains", () => {
    it("returns true if element is present", () => {
      assert.strictEqual(includes(3, list(0, 1, 2, 3, 4, 5)), true);
    });
    it("returns false if element is not present", () => {
      assert.strictEqual(includes(3, list(0, 1, 2, 4, 5)), false);
    });
  });
  describe("equals", () => {
    it("returns false if lists are not of the same length", () => {
      assert.isFalse(equals(list(0, 1, 2, 3), list(0, 1, 2, 3, 4)));
    });
    it("returns false if elements differ in content", () => {
      assert.isFalse(equals(list(0, 1, 9, 3, 4), list(0, 1, 2, 3, 4)));
    });
    it("returns true if lists are identical", () => {
      const l = list(0, 1, 2, 3, 4);
      assert.isTrue(equals(l, l));
    });
    it("returns true if lists are equivalent", () => {
      assert.isTrue(equals(list(0, 1, 2, 3, 4), list(0, 1, 2, 3, 4)));
    });
    it("compares elements with function", () => {
      assert.isTrue(
        L.equalsWith(
          (n, m) => Math.floor(n) === Math.floor(m),
          L.list(2.1, 2.4, 3.8, 1.3),
          L.list(2.7, 2.4, 3.2, 1.9)
        )
      );
    });
  });
  describe("iteration", () => {
    it("iterates over leftwise dense list", () => {
      [
        20, // a list where there is no elements in tree
        50, // both suffix and prefix
        1000, // a tree with larger depth,
        32 ** 2 + 3 // an even larger tree
      ].forEach(n => {
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
  describe("update", () => {
    it("changes element in prefix", () => {
      const l = prependList(0, 32 * 4);
      const l2 = update(14, -1, l);
      assert.strictEqual(nth(14, l2), -1);
    });
    it("changes element in suffix", () => {
      const l = appendList(0, 32 * 4);
      const l2 = update(14, -1, l);
      assert.strictEqual(nth(14, l2), -1);
    });
    it("changes element in the middle of appended tree", () => {
      const l = appendList(0, 32 ** 3);
      const index = Math.floor(32 ** 3 / 2);
      const l2 = update(index, -1, l);
      assert.strictEqual(nth(index, l2), -1);
    });
    it("changes element in the middle of prepended tree", () => {
      const l = prependList(0, 32 ** 3);
      const index = Math.floor(32 ** 3 / 2);
      const l2 = update(index, -1, l);
      assert.strictEqual(nth(index, l2), -1);
    });
    it("changes first element in tree", () => {
      const l = prependList(0, 32 * 3);
      const l2 = update(32, -1, l);
      assert.strictEqual(nth(32, l2), -1);
    });
    it("changes last element in tree", () => {
      const l = prependList(0, 32 ** 3);
      const l2 = update(32 ** 3 - 32, -1, l);
      assert.strictEqual(nth(32 ** 3 - 32, l2), -1);
    });
    it("sets entire list", () => {
      const length = 32 ** 3;
      let l = empty();
      for (let i = 0; i < length; ++i) {
        l = prepend(-1, l);
      }
      for (let i = 0; i < length; ++i) {
        l = update(i, i, l);
      }
      assertIndicesFromTo(l, 0, length);
    });
    it("works with size tables", () => {
      const size = 32 * 5 + 1;
      const catenated = concat(appendList(0, size), appendList(size, size * 2));

      const list1 = update(32 * 7, 0, catenated);
      assert.strictEqual(nth(32 * 7, list1), 0);

      const list2 = update(32 + 162, 0, catenated);
      assert.strictEqual(nth(32 + 162, list2), 0);

      const list3 = update(40, 0, catenated);
      assert.strictEqual(nth(40, list3), 0);
    });
    it("returns list unchanged if out of bounds", () => {
      const l = list(0, 1, 2, 3, 4);
      assert.strictEqual(update(-1, 3, l), l);
      assert.strictEqual(update(5, 3, l), l);
    });
  });
  describe("adjust", () => {
    it("it applies function to index", () => {
      const l = list(0, 1, 2, 3, 4, 5);
      const l2 = adjust(2, square, l);
      assert.strictEqual(nth(2, l2), 4);
    });
    it("returns list unchanged if out of bounds", () => {
      const l = list(0, 1, 2, 3, 4);
      assert.strictEqual(adjust(-1, square, l), l);
      assert.strictEqual(adjust(5, square, l), l);
    });
  });
  describe("slice", () => {
    it("returns same list when nothing is sliced off", () => {
      [[100, 0, 100], [100, -120, 120]].forEach(([n, from, to]) => {
        const l = appendList(0, n);
        const sliced = L.slice(from, to, l);
        assert.strictEqual(l, sliced);
      });
    });
    it("returns empty list when end is before start", () => {
      const l = appendList(0, 100);
      assert.strictEqual(length(L.slice(50, 50, l)), 0);
      assert.strictEqual(length(L.slice(55, 34, l)), 0);
    });
    it("can slice to infinity", () => {
      const sliced = L.slice(2, Infinity, list(0, 1, 2, 3, 4, 5));
      assert.equal(sliced.length, 4);
      assertIndicesFromTo(sliced, 2, 5);
    });
    [
      {
        n: 32 * 3 + 10,
        from: 4,
        to: Infinity,
        prepend: true,
        msg: "slices off of prefix"
      },
      {
        n: 10000,
        from: 2,
        to: 6,
        prepend: false,
        msg: "slices part prefix"
      },
      {
        n: 32 * 3 + 10,
        from: 0,
        to: -3,
        prepend: false,
        msg: "slices off of suffix"
      },
      {
        n: 32 * 3,
        from: 32 * 3 - 10,
        to: 32 * 3 - 2,
        prepend: false,
        msg: "slices part of suffix"
      },
      {
        n: 32 * 3,
        from: 34,
        to: Infinity,
        prepend: false,
        msg: "slices tree from left"
      },
      {
        n: 32 ** 3 + 38,
        from: 1000,
        to: Infinity,
        prepend: false,
        msg: "slices large tree from left"
      },
      {
        // will go down 0 -> 31 -> 31 -> 27 the 27 will be moved to
        // the prefix and will have an empty path that should be
        // pruned
        n: 32 ** 4 + 38,
        from: 32 ** 3 - 5 + 32,
        to: Infinity,
        prepend: false,
        msg: "slices from left when a paths single leaf is moved to prefix"
      },
      {
        n: 32 * 3 + 5,
        from: 0,
        to: 32 * 3,
        prepend: false,
        msg: "slices from right a number of elements equal to suffix length"
      },
      {
        // will go down 31 -> 0 -> 0 -> 27 the 27 will be moved to
        // the prefix and will have an empty path that should be
        // pruned
        n: 32 ** 4 + 38,
        from: 0,
        to: 32 ** 4 + 32,
        prepend: false,
        msg: "slices from right when a paths single leaf is moved to prefix"
      },
      {
        // will go down into two neighbor leaf nodes and move them to affixes
        n: 32 ** 2 + 38,
        from: 32 * 4 + 12,
        to: 32 * 4 + 12 + 36,
        prepend: false,
        msg: "sets root to undefined when sliced fits into affixes"
      },
      {
        n: 65,
        from: 38,
        to: 49,
        prepend: false,
        msg: "slices down into tree leaf node"
      },
      {
        n: 97,
        from: 34,
        to: 48,
        prepend: false,
        msg: "tree is reduced to single affix"
      },
      {
        n: 32 ** 3 + 19,
        from: 312,
        to: 518,
        prepend: false,
        msg:
          "slices when both indices lie in the tree and the height must be reduced"
      },
      {
        n: 32 ** 3,
        from: 500,
        to: 32 ** 3 - 500,
        prepend: false,
        msg: "slices a some elements of both ends of a deep tree"
      }
    ].forEach(({ n, from, to, prepend, msg }) => {
      it(msg, () => {
        const l = prepend ? prependList(0, n) : appendList(0, n);
        const sliced = L.slice(from, to, l);
        const end = to < 0 ? n + to : Math.min(to, n);
        assert.strictEqual(sliced.length, end - from);
        if (sliced.length <= 64) {
          // if the sliced list can fit into affixes the root should
          // be undefined
          assert.isUndefined(sliced.root);
        }
        cheapAssertIndicesFromTo(sliced, from, end);
      }).timeout(50000);
    });
    it("sliced list can be concated", () => {
      // This test catches a bug where the list `left` below would not
      // get the correct height from `slice`. This incorrect height
      // makes the following concat fail.
      const l = range(0, 128);
      const left = L.slice(0, 50, l);
      const l2 = concat(left, range(50, 100));
      assert.strictEqual(l2.length, 100);
      assertIndicesFromTo(l2, 0, 100);
    });
    it("reduces height", () => {
      const size = 32 ** 3 + 32;
      // This test case tests that the height of the tree is reduced
      // when a deep tree is sliced into a very small tree.
      const l = range(0, size);
      const left = 15808;
      const right = left + 2 * 32 + 16;
      const l2 = L.slice(left, right, l);
      // Tree should have one layer so we should find number in array
      assert.isNumber(l2.root!.array[0]);
      assert.strictEqual(nth(40, l2), left + 40);
      assertIndicesFromTo(l2, left, left + 2 * 32 + 16);
    });
    it("reduces height when joining slices", () => {
      // This test creates a tree with three layers and slices down
      // left 0 -> 31 -> 3 and right 1 -> 1 -> 2. This means that
      // since 0 != 1 we invoke sliceLeft and sliceRight with nothing
      // in the middle. The left slice becomes undefined so the single
      // right slice becomes the top of the tree and the height can
      // then be reduced.
      const size = 32 ** 3;
      const l = range(0, size);
      const l2 = L.slice(1027, 1090, l);
      // Tree should have one layer so we should find number in array
      assert.isNumber(l2.root!.array[0].array[0]);
      assertIndicesFromTo(l2, 1027, 1090);
    });
    it("slice handles size tables from concat when slicing from left", () => {
      const size = 32 ** 2;
      const l = concat(appendList(0, size), appendList(size, 2 * size));
      cheapAssertIndicesFromTo(l, 0, 2 * size);
      const left = 100;
      const right = 2 * size;
      const sliced = L.slice(left, right, l);
      cheapAssertIndicesFromTo(sliced, left, right);
    });
    it("slice handles size tables from concat both ends", () => {
      const size = 32 ** 2;
      const l = concat(appendList(0, size), appendList(size, 2 * size));
      const left = 100;
      const right = 2 * size - 100;
      const sliced = L.slice(left, right, l);
      cheapAssertIndicesFromTo(sliced, left, right);
    });
    it("handles size tables when indexing", () => {
      // In this test `slice` must select the right path based on the
      // size tables that results from the concatenation.
      const sum = 52 + 65;
      const l = concat(appendList(0, 52), appendList(52, sum));
      const left = 62;
      const right = 106;
      const sliced = L.slice(left, right, l);
      cheapAssertIndicesFromTo(sliced, left, right);
    });
  });
  describe("drop", () => {
    it("drops element from the left", () => {
      ([
        [10, 20, true], // we only take from suffix
        [10, 32 * 3, false], // we should only take from prefix
        [100, 1000, true], // stop in tree
        [999, 1000, true],
        [64, 32 ** 3 + 32 * 3, true] // height should be reduced
      ] as [number, number, boolean][]).forEach(([amount, n, shouldAppend]) => {
        const l = shouldAppend ? appendList(0, n) : prependList(0, n);
        const dropped = drop(amount, l);
        assert.strictEqual(dropped.length, n - amount);
        assertIndicesFromTo(dropped, amount, n);
      });
    });
    it("returns same list when dropping zero elements", () => {
      [[0, 10], [0, 120]].forEach(([amount, n]) => {
        const l = appendList(0, n);
        const taken = drop(amount, l);
        assert.strictEqual(l, taken);
      });
    });
    it("drops element from the right", () => {
      ([
        [10, 20, true], // we only take from suffix
        [10, 32 * 3, false], // we should only take from prefix
        [100, 1000, true], // stop in tree
        [999, 1000, true],
        [64, 32 ** 3 + 32 * 3, true] // height should be reduced
      ] as [number, number, boolean][]).forEach(([amount, n, shouldAppend]) => {
        const l = shouldAppend ? appendList(0, n) : prependList(0, n);
        const dropped = dropLast(amount, l);
        assert.strictEqual(dropped.length, n - amount);
        assertIndicesFromTo(dropped, 0, n - amount);
      });
    });
  });
  describe("take", () => {
    it("takes element from the left", () => {
      ([
        [10, 20, true], // we only take from suffix
        [10, 32 * 3, false], // we should only take from prefix
        [100, 1000, true], // stop in tree
        [999, 1000, true],
        [64, 32 ** 3 + 32 * 3, true] // height should be reduced
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
    it("takes element from the right", () => {
      ([
        [10, 20, true], // we only take from suffix
        [10, 32 * 3, false], // we should only take from prefix
        [100, 1000, true], // stop in tree
        [999, 1000, true],
        [64, 32 ** 3 + 32 * 3, true] // height should be reduced
      ] as [number, number, boolean][]).forEach(([amount, n, shouldAppend]) => {
        const l = shouldAppend ? appendList(0, n) : prependList(0, n);
        const taken = takeLast(amount, l);
        assert.strictEqual(taken.length, amount);
        assertIndicesFromTo(taken, n - amount, n);
      });
    });
  });
  describe("takeWhile", () => {
    it("takes elements as long as predicate is true", () => {
      const l = list(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
      const l2 = takeWhile(n => n < 6, l);
      assert.strictEqual(l2.length, 6);
      assertIndicesFromTo(l2, 0, 6);
    });
  });
  describe("dropWhile", () => {
    it("drops elements that satisfies the predicate", () => {
      const l = list(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
      const l2 = dropWhile(n => n < 6, l);
      assert.strictEqual(l2.length, 4);
      assertIndicesFromTo(l2, 6, 10);
    });
  });
  describe("concat and slice", () => {
    check("concat then splitAt is no-op", genBigList.replicate(2), ([l, m]) => {
      const [l2, m2] = L.splitAt(l.length, L.concat(l, m));
      checkList(l2);
      checkList(m2);
      assert.isTrue(L.equals(l, l2));
      assert.isTrue(L.equals(m, m2));
      return true;
    });
    check(
      "splitAt then concat is no-op",
      P.range(2)
        .big()
        .array()
        .chain(xs => P.record({ xs: P.Gen.of(xs), i: P.range(xs.length + 1) })),
      ({ xs, i }) => {
        const li = list(...xs);
        const [left, right] = splitAt(i, li);
        assertListEqual(concat(left, right), li);
        return true;
      }
    );
    check(
      "concat then slice",
      P.between(0, 5000)
        .replicate(2)
        .chain(([n, m]) =>
          P.range(n + m + 1).chain(to =>
            P.record({
              n: P.Gen.of(n),
              m: P.Gen.of(m),
              to: P.Gen.of(to),
              from: P.range(to + 1)
            })
          )
        ),
      ({ n, m, from, to }) => {
        const left = L.range(0, n);
        const right = L.range(n, n + m);
        const cat = L.concat(left, right);
        const sliced = L.slice(from, to, cat);
        assert.deepEqual(
          L.toArray(sliced),
          numberArray(0, n)
            .concat(numberArray(n, n + m))
            .slice(from, to)
        );
        return true;
      }
    );
    check(
      "slices elements off concatenated list",
      P.between(0, 10000).chain(n =>
        P.between(0, n)
          .three()
          .map(ns => [n, ...ns])
      ),
      ([n, a, b, c]) => {
        // console.log(n, a, b, c);
        const fst = L.range(0, a);
        const snd = L.range(a, n);
        const catenated = L.concat(fst, snd);
        const from = Math.min(b, c);
        const to = Math.max(b, c);
        const sliced = L.slice(from, to, catenated);
        cheapAssertIndicesFromTo(sliced, from, to);
        return true;
      }
    );
  });
  describe("splitAt", () => {
    it("splits at index", () => {
      const l = list(0, 1, 2, 3, 4, 5, 6, 7, 8);
      const [left, right] = splitAt(4, l);
      assertIndicesFromTo(left, 0, 3);
      assertIndicesFromTo(right, 4, 8);
    });
    it("splits at negative index", () => {
      const l = list(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0);
      const [left, right] = splitAt(-4, l);
      assertIndicesFromTo(left, 0, 6);
      assertIndicesFromTo(right, 7, 0);
    });
  });
  describe("remove", () => {
    const l = range(0, 100);
    it("removes element from the start", () => {
      const lr = remove(0, 23, l);
      assert.strictEqual(lr.length, 100 - 23);
      assertIndicesFromTo(lr, 23, 100);
    });
    it("removes element from the end", () => {
      const lr = remove(60, 40, l);
      assert.strictEqual(lr.length, 100 - 40);
      assertIndicesFromTo(lr, 0, 60);
    });
    it("removes single element at index", () => {
      const l2 = remove(50, 1, l);
      assert.strictEqual(l2.length, 99);
      assertIndicesFromTo(l2, 0, 49);
    });
    it("removes several element at index", () => {
      const l2 = remove(45, 7, l);
      assert.strictEqual(l2.length, 100 - 7);
      assertIndicesFromTo(l2, 0, 45);
      assertIndicesFromTo(l2, 45 + 7, 100, 45);
    });
  });
  describe("tail", () => {
    it("removes the first element", () => {
      const l = prependList(0, 20);
      const tailed = tail(l);
      assert.strictEqual(tailed.length, 19);
      assertIndicesFromTo(tailed, 1, 20);
    });
  });
  describe("pop", () => {
    it("removes the last element", () => {
      const l = prependList(0, 20);
      const tailed = pop(l);
      assert.strictEqual(tailed.length, 19);
      assertIndicesFromTo(tailed, 0, 19);
    });
  });
  describe("toArray", () => {
    it("converts list to array", () => {
      const l = list(0, 1, 2, 3, 4, 5, 6, 7);
      const array = toArray(l);
      assert.deepEqual(array, [0, 1, 2, 3, 4, 5, 6, 7]);
    });
  });
  describe("fromArray", () => {
    it("converts an array into a list", () => {
      const array = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const l = fromArray(array);
      assert.strictEqual(l.length, array.length);
      assertIndicesFromTo(l, 0, 9);
    });
  });
  describe("fromIterable", () => {
    function* iterable(n: number): IterableIterator<number> {
      for (let i = 0; i < n; ++i) {
        yield i;
      }
    }
    it("converts an iterable into a list", () => {
      const l = fromIterable(iterable(20));
      assert.strictEqual(l.length, 20);
      assertIndicesFromTo(l, 0, 20);
    });
  });
  describe("insert and insertAll", () => {
    it("inserts element in list", () => {
      const l = list(0, 1, 2, 3, 5, 6, 7);
      const l2 = insert(4, 4, l);
      assert.strictEqual(nth(4, l2), 4);
      assertIndicesFromTo(l2, 0, 8);
    });
    it("inserts all elements in list", () => {
      const l = list(0, 1, 2, 6, 7, 8);
      const l2 = insertAll(3, list(3, 4, 5), l);
      assertIndicesFromTo(l2, 0, 9);
    });
  });
  describe("reverse", () => {
    it("reverses a list", () => {
      const l = list(7, 6, 5, 4, 3, 2, 1, 0);
      const l2 = reverse(l);
      assertIndicesFromTo(l2, 0, 8);
    });
  });
  describe("isList", () => {
    it("returns true for list", () => {
      assert.isTrue(L.isList(list(0, 1, 2, 3)));
    });
    it("gives correct type", () => {
      const l: any = list(0, 1, 2, 3, 4);
      if (L.isList<number>(l)) {
        L.append(5, l); // this should not give type error
      }
    });
    it("returns false for other things", () => {
      assert.isFalse(L.isList([0, 1, 2, 3, 4]));
      assert.isFalse(L.isList({ foo: 0, bar: 1 }));
      assert.isFalse(L.isList(7));
      assert.isFalse(L.isList("hello"));
    });
  });
  describe("zip", () => {
    it("can zipWith", () => {
      const l1 = list(0, 1, 2, 3, 4, 5);
      const l2 = list(3, 1, 4, 5, 3, 8);
      const r = L.zipWith(sum, l1, l2);
      assert.isTrue(equals(r, list(3, 2, 6, 8, 7, 13)));
    });
    it("zipWith caps to shortest length", () => {
      const short = list(0, 1, 2);
      const long = list(2, 4, 9, 1, 2, 8);
      assertListEqual(L.zipWith(sum, short, long), list(2, 5, 11));
      assertListEqual(L.zipWith(sum, long, short), list(2, 5, 11));
    });
    it("zip zips too pairs", () => {
      const as = list("a", "b", "c");
      const bs = list(0, 1, 2);
      assertListEqual(L.zip(as, bs), list(["a", 0], ["b", 1], ["c", 2]));
    });
  });
  describe("sorting", () => {
    class Pair {
      constructor(readonly fst: number, readonly snd: number) {}
      "fantasy-land/lte"(b: Pair): boolean {
        if (this.fst === b.fst) {
          return this.snd <= b.snd;
        } else {
          return this.fst <= b.fst;
        }
      }
    }
    function compareNumber(a: number, b: number): -1 | 0 | 1 {
      if (a === b) {
        return 0;
      } else if (a < b) {
        return -1;
      } else {
        return 1;
      }
    }
    const unsorted = list(
      { n: 2, m: 1 },
      { n: 1, m: 1 },
      { n: 1, m: 2 },
      { n: 1, m: 3 },
      { n: 0, m: 1 },
      { n: 3, m: 1 }
    );
    const unsortedPairs = list(
      new Pair(2, 1),
      new Pair(1, 1),
      new Pair(1, 2),
      new Pair(1, 2),
      new Pair(1, 3),
      new Pair(0, 1),
      new Pair(3, 1)
    );
    it("sort returns same list on empty list ", () => {
      const l = empty();
      assert.strictEqual(l, L.sort(l));
    });
    it("sort sorts primitives ", () => {
      const l = L.list(5, 2, 9, 1, 7, 3, 9);
      assert.deepEqual(L.toArray(L.sort(l)), L.toArray(l).sort());
    });
    it("sort sorts Fantasy Land Ords", () => {
      const sorted = L.sort(unsortedPairs);
      const sortedPairs = [
        new Pair(0, 1),
        new Pair(1, 1),
        new Pair(1, 2),
        new Pair(1, 2),
        new Pair(1, 3),
        new Pair(2, 1),
        new Pair(3, 1)
      ];
      assert.deepEqual(L.toArray(sorted), sortedPairs);
    });
    it("sortBy returns same list on empty list ", () => {
      const l = empty();
      assert.strictEqual(
        l,
        L.sortBy(_ => {
          throw new Error("Should not be called");
        }, l)
      );
    });
    it("sortBy is stable", () => {
      const sorted = L.sortBy(e => e.n, unsorted);
      assert.deepEqual(L.toArray(sorted), [
        { n: 0, m: 1 },
        { n: 1, m: 1 },
        { n: 1, m: 2 },
        { n: 1, m: 3 },
        { n: 2, m: 1 },
        { n: 3, m: 1 }
      ]);
    });
    it("sortBy sort Fantasy Land Ords", () => {
      const unsorted = L.map(
        pair => ({ pair, sum: pair.fst + pair.snd }),
        unsortedPairs
      );
      const sorted = L.sortBy(o => o.pair, unsorted);
      assert.deepEqual(L.toArray(sorted), [
        { pair: new Pair(0, 1), sum: 1 },
        { pair: new Pair(1, 1), sum: 2 },
        { pair: new Pair(1, 2), sum: 3 },
        { pair: new Pair(1, 2), sum: 3 },
        { pair: new Pair(1, 3), sum: 4 },
        { pair: new Pair(2, 1), sum: 3 },
        { pair: new Pair(3, 1), sum: 4 }
      ]);
    });
    it("sortWith is stable", () => {
      const sorted = L.sortWith((a, b) => compareNumber(a.n, b.n), unsorted);
      assert.deepEqual(L.toArray(sorted), [
        { n: 0, m: 1 },
        { n: 1, m: 1 },
        { n: 1, m: 2 },
        { n: 1, m: 3 },
        { n: 2, m: 1 },
        { n: 3, m: 1 }
      ]);
    });
  });
  describe("group", () => {
    it("group", () => {
      const l = L.list(1, 1, 1, 2, 2, 3, 4, 4);
      assertListEqual(
        L.group(l),
        L.list(L.list(1, 1, 1), L.list(2, 2), L.list(3), L.list(4, 4))
      );
    });
    it("groups empty list to empty list", () => {
      assertListEqual(L.group(L.empty()), L.empty());
    });
    it("groupWith", () => {
      const l = L.list(4.2, 4.5, 1.1, 1.4, 3.5, 3.9);
      const l2 = L.groupWith((a, b) => Math.floor(a) === Math.floor(b), l);
      assertListEqual(
        l2,
        L.list(L.list(4.2, 4.5), L.list(1.1, 1.4), L.list(3.5, 3.9))
      );
    });
  });
});
