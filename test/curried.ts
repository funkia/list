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
  it("partially applied nth can be called on lists of different types", () => {
    const snd = Lc.nth(1);
    const one = snd(Lc.list(0, 1, 2, 3));
    assert.strictEqual(one, 1);
    const b = snd(Lc.list("a", "b", "c", "d"));
    assert.strictEqual(b, "b");
  });
  it("returns pluck with correct type", () => {
    const pluckFoo = Lc.pluck("foo");
    const l = pluckFoo(Lc.list({ foo: 0 }, { foo: 1 }, { foo: 2 }));
    assert.isTrue(Lc.equals(l, Lc.list(0, 1, 2)));
    // Should not give type error since `l` is list of `number`
    assert.equal(Lc.foldl((a: number, b: number) => a + b, 0, l), 3);
  });
  it("can call foldl in all combinations", () => {
    const f = (sum: number, s: string) => sum + s.length;
    const l = Lc.list("hi ", "there");
    const r1 = Lc.foldl(f, 0, l);
    const r2 = Lc.foldl(f)(0, l);
    const r4 = Lc.foldl(f, 0)(l);
    const r3 = Lc.foldl(f)(0)(l);
    assert.strictEqual(r1, 3 + 5);
    assert.strictEqual(r2, 3 + 5);
    assert.strictEqual(r3, 3 + 5);
    assert.strictEqual(r4, 3 + 5);
  });
  it("can call slice in all combinations", () => {
    const l = Lc.list(0, 1, 2, 3, 4, 5);
    const l1 = Lc.slice(1, 5, l);
    const l2 = Lc.slice(1)(5)(l);
    const l3 = Lc.slice(1, 5)(l);
    const l4 = Lc.slice(1)(5, l);
    assert.isTrue(Lc.equals(l1, Lc.list(1, 2, 3, 4)));
    assert.isTrue(Lc.equals(l2, Lc.list(1, 2, 3, 4)));
    assert.isTrue(Lc.equals(l3, Lc.list(1, 2, 3, 4)));
    assert.isTrue(Lc.equals(l4, Lc.list(1, 2, 3, 4)));
  });
});
