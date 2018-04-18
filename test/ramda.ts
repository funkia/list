import { assert } from "chai";
import * as R from "ramda";

import * as L from "../src/index";
// import * as Lr from "../src/ramda";

// const exceptions = ["setEquals"];

describe("Ramda", () => {
  // These tests are commented out since the Ramda module is deprecated
  /*
  it("has all functions", () => {
    for (const key of Object.keys(L)) {
      const elm = (L as any)[key];
      // Check all non-anonymous functions
      if (
        typeof elm === "function" &&
        elm.name === key &&
        exceptions.indexOf(elm.name) === -1
      ) {
        assert.isTrue(key in Lr);
      }
    }
  });
  it("uses Ramdas equals", () => {
    const l = Lr.list(
      { foo: 1, bar: 2 },
      { foo: 3, bar: 4 },
      { foo: 5, bar: 6 }
    );
    const idx = Lr.indexOf({ foo: 3, bar: 4 }, l);
    assert.strictEqual(idx, 1);
  });
  */
  it("list works with reduceBy", () => {
    type Student = { name: string; score: number };
    const result = R.reduceBy(
      (acc, student) => acc.concat(student.name),
      [] as string[],
      (student: Student) => {
        const score = student.score;
        return score < 65
          ? "F"
          : score < 70 ? "D" : score < 80 ? "C" : score < 90 ? "B" : "A";
      },
      L.list(
        { name: "Lucy", score: 92 },
        { name: "Drew", score: 85 },
        { name: "Bart", score: 62 }
      ) as any
    );
    assert.deepEqual(result, {
      A: ["Lucy"],
      B: ["Drew"],
      F: ["Bart"]
    });
  });
});
