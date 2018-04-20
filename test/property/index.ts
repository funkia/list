import { assert } from "chai";

import {
  concat,
  empty,
  List,
  prepend,
  append,
  nth,
  slice
} from "../../src/index";

// function numberArray(start: number, end: number): number[] {
//   let array = [];
//   for (let i = start; i < end; ++i) {
//     array.push(i);
//   }
//   return array;
// }

/**
 * Call the body n number of times.
 */
function times(n: number, body: (n: number) => void): void {
  for (let i = 0; i < n; ++i) {
    body(i);
  }
}

function appendList(start: number, end: number, l = empty()): List<number> {
  for (let i = start; i < end; ++i) {
    l = append(i, l);
  }
  return l;
}

function prependList(start: number, end: number, l = empty()): List<number> {
  for (let i = end - 1; i >= start; --i) {
    l = prepend(i, l);
  }
  return l;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function randomInInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// @ts-ignore
function randomBool() {
  return Math.random() > 0.5;
}

function assertIndicesFromTo(
  list: List<number>,
  from: number,
  to: number,
  offset: number = 0
): void {
  for (let i = 0; i < to - from; ++i) {
    assert.strictEqual(nth(i + offset, list), from + i);
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

describe("properties", () => {
  it("concat", () => {
    times(1000, _i => {
      let sum = 0;
      const nrOfLists = 12;
      let l = empty();
      const sizes = [];
      for (let j = 0; j < nrOfLists; ++j) {
        const size = randomInInterval(0, 32 ** 3);
        sizes.push(size);
        const list2 = appendList(sum, sum + size);
        sum += size;
        l = concat(l, list2);
      }
      cheapAssertIndicesFromTo(l, 0, sum);
    });
  });
  it("slice", () => {
    const size = 32000097;
    const l = appendList(0, size);
    times(10000, i => {
      let left: number;
      let right: number;
      if (i % 2 === 0) {
        left = randomInInterval(0, size);
        right = randomInInterval(left, size);
      } else {
        right = randomInInterval(0, size);
        left = randomInInterval(0, right);
      }
      try {
        const sliced = slice(left, right, l);
        cheapAssertIndicesFromTo(sliced, left, right);
      } catch (err) {
        console.log("Slice error: ", left, "to", right);
        throw err;
      }
    });
  });
  it("concat and prepend", () => {
    times(10000, _n => {
      try {
        const prependSize = 10000;
        const nrOfListsToConcat = randomInInterval(5, 25);

        let offset = prependSize;
        let concatenated = empty();
        times(nrOfListsToConcat, () => {
          const size = randomInInterval(100, 1000);
          const list = prependList(offset, offset + size);
          // side-effects
          concatenated = concat(concatenated, list);
          offset += size;
        });
        const final = prependList(0, prependSize, concatenated);
        cheapAssertIndicesFromTo(final, 0, offset);
      } catch (err) {
        console.log(_n);
        throw err;
      }
    });
  });
  it("concat and slice", () => {
    times(10000, _n => {
      const nrOfListsToConcat = 2; // randomInInterval(3, 14);

      let offset = 0;
      let concatenated = empty();
      times(nrOfListsToConcat, () => {
        const size = randomInInterval(100, 10000);
        const list = prependList(offset, offset + size);
        // side-effects
        concatenated = concat(concatenated, list);
        offset += size;
      });
      const a = randomInInterval(0, concatenated.length);
      const b = randomInInterval(0, concatenated.length);
      const from = Math.min(a, b);
      const to = Math.max(a, b);
      const final = slice(from, to, concatenated);
      try {
        cheapAssertIndicesFromTo(final, from, to);
      } catch (err) {
        console.log(_n);
        console.log(from);
        throw err;
      }
    });
  });
});
