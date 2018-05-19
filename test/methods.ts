import { assert } from "chai";

import * as L from "../src/index";
import * as Lm from "../src/methods";

const K: typeof L = undefined as any;

const exceptions = [
  "Node",
  "List",
  "list",
  "pair",
  "repeat",
  "times",
  "range",
  "fromArray",
  "fromIterable",
  "isList"
];

describe("methods", () => {
  it("has all functions", () => {
    const l = Lm.list(0);
    for (const key of Object.keys(L)) {
      const k: keyof (typeof K) = key as any;
      const elm = L[k];
      // Check all non-anonymous functions
      if (
        typeof elm === "function" &&
        elm.name === k &&
        exceptions.indexOf(elm.name) === -1
      ) {
        assert.isTrue(key in l, `missing function ${key}`);
      }
    }
  });
  it("can chain", () => {
    const l = Lm.list(
      { name: "Foo bar" },
      { name: "Foo baz" },
      { name: "Alan Turing" },
      { name: "Haskell Curry" }
    );
    const l2 = l
      .pluck("name")
      .filter(n => n[0] === "F")
      .take(2);
    assert.equal(l2.nth(0), "Foo bar");
    assert.equal(l2.nth(1), "Foo baz");
  });
});
