import { assert } from "chai";

import { FingerTree, prepend, append, toArray, size, get, nil, foldl, concat } from "../src/finger";

function randomNumber(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomBool(): boolean {
  return Math.random() > 0.5;
}

function subtract(n: number, m: number): number {
  return n - m;
}

function createList(from: number, n: number): FingerTree<number> {
  let list: FingerTree<number> = nil;
  for (let i = from; i < from + n; ++i) {
    list = append(i, list);
  }
  return list;
}

function createArray(from: number, n: number): number[] {
  let array = [];
  for (let i = from; i < from + n; ++i) {
    array.push(i);
  }
  return array;
}

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
  describe("concat", () => {
    it("empty list to list", () => {
      const list = createList(0, 10);
      const concatenated = concat(list, nil);
      assert.deepEqual(toArray(concatenated), createArray(0, 10));
      const concatenated2 = concat(nil, list);
      assert.deepEqual(toArray(concatenated2), createArray(0, 10));
    });
    it("singleton list to list", () => {
      const list = createList(0, 10);
      const singleton = prepend(10, nil);

      const concatenated = concat(list, singleton);
      const array = createArray(0, 11);
      assert.deepEqual(toArray(concatenated), array);

      const concatenated2 = concat(singleton, list);
      const array2 = createArray(0, 10);
      array2.unshift(10);
      assert.deepEqual(toArray(concatenated2), array2);
    });
    it("can index into concatenated lists", () => {
      const list1 = createList(0, 20);
      const list2 = createList(20, 20);
      const concatenated = concat(list1, list2);
      for (let i = 0; i < 40; ++i) {
        assert.strictEqual(get(i, concatenated), i);
      }
    });
    it("two lists", () => {
      let times = 100;
      while (--times > 0) {
        const array1 = [];
        const array2 = [];
        const n = randomNumber(300);
        const m = randomNumber(300);
        let list1 = nil;
        let list2 = nil;
        for (let i = 0; i < n; ++i) {
          if (randomBool()) {
            list1 = append(i, list1);
            array1.push(i);
          } else {
            list1 = prepend(i, list1);
            array1.unshift(i);
          }
        }
        for (let i = 0; i < m; ++i) {
          if (randomBool()) {
            list2 = append(i, list2);
            array2.push(i);
          } else {
            list2 = prepend(i, list2);
            array2.unshift(i);
          }
        }
        const concatenated = concat(list1, list2);
        const array = array1.concat(array2);
        assert.deepEqual(toArray(concatenated), array);
      }
    });
  });
  describe("indexing", () => {
    it("can index", () => {
      const list = prepend(5, prepend(4, prepend(3, prepend(2, prepend(1, prepend(0, nil))))));
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
    it("can large index into prepend built tree", () => {
      const n = 10000;
      let list: FingerTree<number> = nil;
      for (let i = 0; i < n; ++i) {
        list = prepend(i, list);
      }
      let arr: number[] = [];
      for (let i = 0; i < n; ++i) {
        arr.push(get(i, list));
      }
      assert.deepEqual(arr, toArray(list));
    });
  });
  describe("folding", () => {
    describe("foldl", () => {
      it("fold left over tree with no subtree", () => {
        const list = append(5, append(4, prepend(0, prepend(1, prepend(2, prepend(3, nil))))));
        assert.strictEqual(
          foldl(subtract, 10, list),
          [0, 1, 2, 3, 4, 5].reduce(subtract, 10)
        );
      });
      it("folds left", () => {
        const list = prepend(5, prepend(4, prepend(3, prepend(2, prepend(1, prepend(0, nil))))));
        assert.strictEqual(
          foldl(subtract, 10, list),
          [5, 4, 3, 2, 1, 0].reduce(subtract, 10)
        );
      });
      it("can fold left over large tree", () => {
        const n = 10000;
        let list: FingerTree<number> = nil;
        let array: number[] = [];
        for (let i = 0; i < n; ++i) {
          list = prepend(i, list);
          array.push(i);
        }
        array.reverse();
        assert.strictEqual(
          foldl(subtract, 10, list),
          array.reduce(subtract, 10)
        );
      });
    });
  });
});
