import { assert } from "chai";

import * as L from "../src/index";
import * as Lr from "../src/ramda";

describe("Ramda", () => {
  it("has all functions", () => {
    for (const key of Object.keys(L)) {
      const elm = (L as any)[key];
      // Check all non-anonymous functions
      if (typeof elm === "function" && elm.name === key) {
        assert.isTrue(key in Lr);
      }
    }
  });
});
