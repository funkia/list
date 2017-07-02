import { assert } from "chai";

import { empty } from "../src/radix";

describe("Radix", () => {
  describe("append", () => {
    it("can append small", () => {
      const list = empty().append(1).append(2).append(3).append(4);
      assert.strictEqual(list.nth(0), 1);
      assert.strictEqual(list.nth(1), 2);
      assert.strictEqual(list.nth(2), 3);
      assert.strictEqual(list.nth(3), 4);
    });
    it("can append large", () => {
      let list = empty();
      const size = 10000;
      for (let i = 0; i < size; ++i) {
        list = list.append(i);
      }
      for (let i = 0; i < size; ++i) {
        assert.strictEqual(list.nth(i), i);
      }
    });
  });
});
