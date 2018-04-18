import { assert } from "chai";

import * as L from "../src/index";
import * as Lf from "../src/fantasy-land";

const exceptions = ["setEquals"];

describe("Fantasy Land", () => {
  it("has all functions", () => {
    for (const key of Object.keys(L)) {
      const elm = (L as any)[key];
      // Check all non-anonymous functions
      if (
        typeof elm === "function" &&
        elm.name === key &&
        exceptions.indexOf(elm.name) === -1
      ) {
        assert.isTrue(key in Lf);
      }
    }
  });
  describe("setoid", () => {
    it("has Fantasy Land method", () => {
      assert.isTrue(
        L.list(0, 1, 2, 3, 4)["fantasy-land/equals"](L.list(0, 1, 2, 3, 4))
      );
    });
  });
  describe("monoid", () => {
    it("has fantasy land empty", () => {
      L.list(0, 1, 2)["fantasy-land/empty"]();
    });
    it("has fantasy land concat", () => {
      L.list(0, 1, 2)["fantasy-land/concat"](L.list(3, 4));
    });
  });
  describe("monad", () => {
    it("has map method", () => {
      const n = 50;
      const l = L.range(0, n);
      const mapped = l["fantasy-land/map"](m => m * m);
      for (let i = 0; i < n; ++i) {
        assert.strictEqual(L.nth(i, mapped), i * i);
      }
    });
    it("has ap method", () => {
      const l = L.list(1, 2, 3)["fantasy-land/ap"](
        L.list((n: number) => n + 2, (n: number) => 2 * n, (n: number) => n * n)
      );
      assert.isTrue(L.equals(l, L.list(3, 4, 5, 2, 4, 6, 1, 4, 9)));
    });
    it("has chain method", () => {
      const l = L.list(1, 2, 3);
      const l2 = l["fantasy-land/chain"](n => L.list(n, 2 * n, n * n));
      assert.isTrue(L.equals(l2, L.list(1, 2, 1, 2, 4, 4, 3, 6, 9)));
    });
  });
  describe("traversable", () => {
    it("has reduce method", () => {
      const l = L.list(0, 1, 2, 3, 4, 5);
      const result = l["fantasy-land/reduce"](
        (arr, i) => (arr.push(i), arr),
        <number[]>[]
      );
      assert.deepEqual(result, [0, 1, 2, 3, 4, 5]);
    });
  });
  describe("filterable", () => {
    it("has Fantasy Land method", () => {
      assert.strictEqual(
        L.list(0, 1, 2, 3, 4, 5)["fantasy-land/filter"](n => n % 2 === 0)
          .length,
        3
      );
    });
  });
});
