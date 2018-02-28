import { assert } from "chai";

import * as L from "../src/index";
import { List } from "../src/index";

// These three getter functions are identical to the unexported functions in
// `src/index.ts` with the same names.

const affixBits = 6;
const affixMask = 0b111111;

function getSuffixSize(l: List<any>): number {
  return l.bits & affixMask;
}

function getPrefixSize(l: List<any>): number {
  return (l.bits >> affixBits) & affixMask;
}

function getDepth(l: List<any>): number {
  return l.bits >> (affixBits * 2);
}

function computeDepth(node: any, direction: number): number {
  if (node && Array.isArray(node.array) && "sizes" in node) {
    // This is a node
    const path = Math.floor((node.array.length - 1) * direction);
    return 1 + computeDepth(node.array[path], direction);
  } else {
    return -1;
  }
}

/**
 * This functions checks that the given list satisfies all invariants. It also
 * performs a bunch of other sanity check to ensure that the given list is
 * constructed correctly.
 *
 * This functions also serves as documentation for the invariants.
 *
 * Throws if an error is found.
 */
export function checkList<A>(l: List<A>): void {
  const depth = getDepth(l);

  // If a list has a tree (i.e. root is not undefined) then both the suffix and
  // the prefix must contain elements.
  if (l.root !== undefined) {
    assert.notEqual(getSuffixSize(l), 0);
    assert.notEqual(getPrefixSize(l), 0);
    assert.exists(l.prefix);
    assert.exists(l.suffix);
  }

  // Depth should be 0 if `l.root` is undefined.
  if (l.root === undefined) {
    assert.equal(depth, 0, "root was undefined but depth was not 0");
  }

  // Check that the declared depth is equal to the depth found by manually
  // traversing the tree.
  if (l.root !== undefined) {
    const msg = "depth is incorrect";
    assert.equal(depth, computeDepth(l.root, 0), msg); // Check the left-most path
    assert.equal(depth, computeDepth(l.root, 0.25), msg);
    assert.equal(depth, computeDepth(l.root, 0.5), msg); // Check the middle path
    assert.equal(depth, computeDepth(l.root, 0.75), msg);
    assert.equal(depth, computeDepth(l.root, 1), msg); // Check the right-most path
  }
}

export function installCheck(library: any): any {
  const newLibrary: any = {};
  for (const name of Object.keys(library)) {
    if (typeof library[name] === "function") {
      const fn = library[name];
      newLibrary[name] = (...args: any[]) => {
        const result = fn(...args);
        if (L.isList(result)) {
          // This is a list, apply checks
          checkList(result);
        }
        return result;
      };
    } else {
      newLibrary[name] = library[name];
    }
  }
  return newLibrary;
}
