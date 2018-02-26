import { assert } from "chai";

import * as L from "../src/index";
import * as Lc from "../src/curried";

const exceptions = ["setEquals"];

describe("curried", () => {
  it("has all functions", () => {
    for (const key of Object.keys(L)) {
      const elm = (L as any)[key];
      // Check all non-anonymous functions
      if (typeof elm === "function" && exceptions.indexOf(elm.name) === -1) {
        assert.isTrue(key in Lc, `Missing key ${key}`);
        assert.strictEqual(
          (L as any)[key].length,
          (Lc as any)[key].length,
          `Incorrect arity for ${key}`
        );
      }
    }
  });
  it("has curried map", () => {
    const l = Lc.map((n: number) => n * n)(Lc.list(1, 2, 3, 4));
    assert.isTrue(Lc.equals(l, Lc.list(1, 4, 9, 16)));
  });
});
