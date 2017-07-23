import { Cons } from "./list";
import * as C from "./list";

const branchingFactor = 32;
const bits = 5;
const mask = 31;

function createPath(depth: number, value: any): Node {
  const top = new Node([]);
  let current = top;
  for (let i = 0; i < depth; ++i) {
    let temp = new Node([]);
    current.array[0] = temp;
    current = temp;
  }
  current.array[0] = value;
  return top;
}

function copyArray(source: any[]): any[] {
  const array = [];
  for (let i = 0; i < source.length; ++i) {
    array[i] = source[i];
  }
  return array;
}

function copyIndices(
  source: any[], sourceStart: number, target: any[], targetStart: number, length: number
): void {
  for (let i = 0; i < length; ++i) {
    target[targetStart + i] = source[sourceStart + i];
  }
}

export class Node {
  private owner: boolean;
  public sizes: number[];
  constructor(public array: any[]) {
    this.owner = true;
  }
  copy(): Node {
    const result = new Node(copyArray(this.array));
    return result;
  }
  append(value: any): Node {
    let array;
    if (this.owner) {
      this.owner = false;
      array = this.array;
    } else {
      array = copyArray(this.array);
    }
    array.push(value);
    return new Node(array);
  }
  update(depth: number, index: number, value: any): Node {
    const path = (index >> (depth * 5)) & mask;
    const array = this.getArray();
    if (depth === 0) {
      array[path] = value;
    } else {
      let child = this.array[path];
      if (child === undefined) {
        array[path] = createPath(depth - 1, value);
      } else {
        array[path] = child.update(depth - 1, index, value);
      }
    }
    return new Node(array);
  }
  nth(depth: number, index: number): any {
    const path = (index >> (depth * 5)) & mask;
    if (depth === 0) {
      return this.array[path];
    } else {
      return (this.array[path] as Node).nth(depth - 1, index);
    }
  }
  getArray(): any[] {
    if (this.owner) {
      this.owner = false;
      return this.array;
    } else {
      return copyArray(this.array);
    }
  }
}

function cloneNode(node: Node): Node {
  return new Node(node.getArray());
}

function arrayFirst<A>(array: A[]): A {
  return array[0];
}

function arrayLast<A>(array: A[]): A {
  return array[array.length];
}

function suffixToNode<A>(suffix: Cons<A> | undefined): Node {
  return new Node(suffix.toArray().reverse());
}

export class List<A> {
  constructor(
    public depth: number,
    public size: number,
    public root: Node,
    public suffix: Cons<A> | undefined,
    public suffixSize: number
  ) { }
  space(): number {
    return (branchingFactor ** (this.depth + 1)) - (this.size - this.suffixSize);
  }
  append(value: A): List<A> {
    if (this.suffixSize < 32) {
      return new List<A>(
        this.depth,
        this.size + 1,
        this.root,
        new Cons(value, this.suffix),
        this.suffixSize + 1
      );
    }
    const newSuffix = new Cons(value, undefined);
    const suffixNode = suffixToNode(this.suffix);
    if (this.size === 32) {
      return new List<A>(
        0, this.size + 1, suffixNode, newSuffix, 1
      );
    }
    const full = this.space() === 0;
    let node;
    if (full) {
      if (this.depth === 0) {
        node = new Node([this.root, suffixNode]);
      } else {
        node = new Node([this.root, createPath(this.depth - 1, suffixNode)]);
      }
    } else {
      node = this.root.update(this.depth - 1, (this.size - 1) >> 5, suffixNode);
    }
    return new List<A>(
      this.depth + (full ? 1 : 0), this.size + 1, node, newSuffix, 1
    );
  }
  nth(index: number): A | undefined {
    if (index >= this.size - this.suffixSize) {
      return this.suffix.nth(this.size - 1 - index);
    }
    return this.root.nth(this.depth, index);
  }
  static empty(): List<any> {
    return new List(0, 0, undefined, undefined, 0);
  }
}

function cloneList<A>(list: List<A>): List<A> {
  return new List(list.depth, list.size, list.root, list.suffix, list.suffixSize);
}

export function empty(): List<any> {
  return List.empty();
}

export function nth<A>(index: number, list: List<A>): A | undefined {
  return list.nth(index);
}

const eMax = 2;

function createConcatPlan(array: Node[]): number[] | undefined {
  const sizes = [];
  let sum = 0;
  for (let i = 0; i < array.length; ++i) {
    sum += array[i].array.length;
    sizes[i] = array[i].array.length;
  }
  const optimalLength = Math.ceil(sum / branchingFactor);
  let n = array.length;
  let i = 0;
  if (optimalLength + eMax >= n) {
    return undefined; // no rebalancing needed
  }
  while (optimalLength + eMax < n) {
    while (sizes[i] <= branchingFactor - (eMax / 2)) {
      // Skip nodes that are already sufficiently balanced
      ++i;
    }
    let r = sizes[i];
    while (r > 0) {
      const minSize = Math.min(r + sizes[i + 1], branchingFactor);
      sizes[i] = minSize;
      r = r + sizes[i + 1] - minSize;
      ++i; // Maybe change to for-loop
    }
    for (let j = i; j <= n - 1; ++j) {
      sizes[i] = sizes[i + 1];
    }
    --i;
    --n;
  }
  sizes.length = n;
  return sizes;
}

function concatNodeMerge<A>(left: Node, center: Node, right: Node): any[] {
  return left.array.slice(0, -1).concat(center.array, right.array.slice(1));
}

function executeConcatPlan(merged: any[], plan: number[]): any[] {
  let offset = 0;
  const result = [];
  for (const toMove of plan) {
    const node = new Node([]);
    for (let i = 0; i < toMove; ++i) {
      node.array[i] = merged[offset++];
    }
    result.push(node);
  }
  return result;
}

function rebalance<A>(
  left: Node, center: Node, right: Node, top: boolean
): Node {
  const merged = concatNodeMerge(left, center, right);
  const plan = createConcatPlan(merged);
  const balanced =
    plan !== undefined ? executeConcatPlan(merged, plan) : merged;
  if (balanced.length < branchingFactor) {
    if (top === false) {
      // Return a single node with extra height for balancing at next
      // level
      return new Node([new Node(balanced)]);
    }
  } else {
    return new Node([
      new Node(balanced.slice(0, branchingFactor)),
      new Node(balanced.slice(branchingFactor))
    ]);
  }
}

function concatSubTrie<A>(
  left: Node, lDepth: number, right: Node, rDepth: number, isTop: boolean
): Node {
  if (lDepth > rDepth) {
    const c = concatSubTrie(arrayLast(left.array), lDepth - 1, right, rDepth, false);
    return rebalance(left, c, undefined, isTop);
  } else if (lDepth < rDepth) {
    const c = concatSubTrie(left, lDepth, arrayFirst(right.array), rDepth - 1, false);
    return rebalance(undefined, c, right, isTop);
  } else if (lDepth === 0) {
    if (isTop && left.array.length + right.array.length <= branchingFactor) {
      return new Node([new Node(left.array.concat(right.array))]);
    } else {
      return new Node([left, right]);
    }
  } else {
    const c = concatSubTrie<A>(
      arrayLast(left.array),
      lDepth - 1,
      arrayFirst(right.array),
      rDepth - 1,
      false
    );
    return rebalance(left, c, right, isTop);
  }
}

function getHeight(node: Node): number {
  if (node.array[0] instanceof Node) {
    return 1 + getHeight(node.array[0]);
  } else {
    return 0;
  }
}

/* Takes the old RRB-tree, the new RRB-tree, and the new tail. It then
  mutates the new RRB-tree so that the tail it currently points to is
  pushed down, sets the new tail as new tail, and returns the new RRB.
  */
function pushDownTail<A>(
  oldList: List<A>,
  newList: List<A>,
  suffixNode: Node,
  newSuffix: Cons<A>,
  newSuffixSize: number
): List<A> {
  // install the new suffix in location
  newList.suffix = newSuffix;
  newList.suffixSize = newSuffixSize;
  if (oldList.size <= branchingFactor) {
    // The old tree has no content in tree, all content is in affixes
    newList.root = suffixNode;
    return newList;
  }
  let index = oldList.size;
  let nodesToCopy = 0;
  let nodesVisited = 0;
  let pos = 0;
  let shift = oldList.depth * 5;
  let currentNode = oldList.root;
  while (shift > 5) {
    let childIndex: number;
    if (true) {
      // does not have size table
      childIndex = (index >> shift) & mask;
      index &= ~(mask << shift); // wipe just used bits
    } else {
      // fixme
    }
    nodesVisited++;
    if (childIndex < mask) {
      // we are not going down the far right path, this implies that
      // there is still room in the current node
      nodesToCopy = nodesVisited;
      pos = childIndex;
    }
    currentNode = currentNode.array[childIndex];
    if (currentNode === undefined) {
      console.log("this will only happen in a pvec subtree");
    }
    shift -= 5;
  }

  if (shift !== 0) {
    nodesVisited++;
    if (currentNode.array.length < branchingFactor) {
      // there is room in the found node
      nodesToCopy = nodesVisited;
      pos = currentNode.array.length;
    }
  }

  if (nodesToCopy === 0) {
    // there was no room in the found node
  } else {
    const node = copyFirstK(oldList, newList, nodesToCopy);
    const leaf = appendEmpty(node, nodesVisited - nodesToCopy);
    leaf.array.push(suffixNode);
  }

  return newList;
}

function copyFirstK(oldList: List<any>, newList: List<any>, k: number): Node {
  let currentNode = cloneNode(oldList.root); // copy root
  newList.root = currentNode; // install root
  // let index = oldList.size - 1;

  for (let i = 1; i < k; ++i) {
    const index = currentNode.array.length - 1;
    const newNode = cloneNode(currentNode.array[index]);
    // TODO: handle size table
    currentNode.array[index] = newNode;
    currentNode = newNode;
    // if (i != k) {
    //   const newCurrent = cloneNode(currentNode);
    //   // fixme handle size table
    // } else {
    //   const newCurrent = cloneNode(currentNode);
    // }

  }
  return currentNode;
}

function appendEmpty(node: Node, depth: number): Node {
  if (depth === 0) {
    return node;
  }
  let current = new Node([]);
  node.array.push(current);
  for (let i = 1; i < depth; ++i) {
    let newNode = new Node([]);
    current.array[0] = newNode;
    current = newNode;
  }
  return current;
}

export function concat<A>(left: List<A>, right: List<A>): List<A> {
  if (left.size === 0) {
    return right;
  } else if (right.size === 0) {
    return left;
  } else if (right.root === undefined) {
    // right is nothing but a suffix
    if (right.suffixSize + left.suffixSize <= branchingFactor) {
      // affixes can fit inside one
      return new List(
        right.depth,
        left.size + right.size,
        left.root,
        C.concat(right.suffix, left.suffix),
        left.suffixSize + right.size
      );
    } else if (left.suffixSize === branchingFactor) {
      // left suffix is full and can be pushed down
      const newList = cloneList(left);
      newList.size += right.size;
      return pushDownTail(left, newList, suffixToNode(newList.suffix), right.suffix, right.suffixSize);
    } else {
      // we must merge the two suffixes and push down
      const newList = cloneList(left);
      newList.size += right.size;
      const newNode = new Node([]);
      const leftSize = left.suffixSize;
      copyIndices(left.suffix.toArray().reverse(), 0, newNode.array, 0, left.suffixSize);
      const rightSize = branchingFactor - leftSize;
      copyIndices(right.suffix.toArray().reverse(), 0, newNode.array, leftSize, rightSize);
      const newSuffixSize = right.suffixSize - rightSize;
      return pushDownTail(left, newList, newNode, C.copyFirst(newSuffixSize, right.suffix), newSuffixSize);
    }
  } else {
    const newSize = left.size + right.size;
    const newNode = concatSubTrie(left.root, left.depth, right.root, left.depth, true);
    const newHeight = getHeight(newNode);
    return new List(newHeight, newSize, newNode, right.suffix, right.suffixSize);
  }
}
