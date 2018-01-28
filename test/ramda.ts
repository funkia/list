import { assert } from "chai";

import * as L from "../src/index";
import * as Lr from "../src/ramda";

const exceptions = ["setEquals"];

describe("Ramda", () => {
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
});
