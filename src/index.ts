const branchingFactor = 32;
const bits = 5;
const mask = 31;

function createPath(depth: number, value: any): Node {
  const top = new Node(undefined, []);
  let current = top;
  for (let i = 0; i < depth; ++i) {
    let temp = new Node(undefined, []);
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

function pushElements<A>(
  source: A[], target: A[], offset: number, amount: number
): void {
  for (let i = offset; i < offset + amount; ++i) {
    target.push(source[i]);
  }
}

function copyIndices(
  source: any[], sourceStart: number, target: any[], targetStart: number, length: number
): void {
  for (let i = 0; i < length; ++i) {
    target[targetStart + i] = source[sourceStart + i];
  }
}

export class Node {
  // sizes: number[];
  constructor(public sizes: number[], public array: any[]) {
  }
  append(value: any): Node {
    const array = copyArray(this.array);
    array.push(value);
    return new Node(undefined, array);
  }
  update(depth: number, index: number, value: any): Node {
    const path = (index >> (depth * 5)) & mask;
    const array = copyArray(this.array);
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
    return new Node(this.sizes, array);
  }
}

function nodeNthDense(node: Node, depth: number, index: number): any {
  let path;
  let current = node;
  for (; depth >= 0; --depth) {
    path = (index >> (depth * 5)) & mask;
    current = current.array[path];
  }
  return current;
}

function nodeNth(node: Node, depth: number, index: number): any {
  let path;
  let current = node;
  while (current.sizes !== undefined) {
    path = (index >> (depth * 5)) & mask;
    while (current.sizes[path] <= index) {
      path++;
    }
    const traversed = path === 0 ? 0 : current.sizes[path - 1];
    index -= traversed;
    depth--;
    current = current.array[path];
  }
  return nodeNthDense(current, depth, index);
}

function cloneNode(node: Node): Node {
  return new Node(node.sizes, copyArray(node.array));
}

function arrayFirst<A>(array: A[]): A {
  return array[0];
}

function arrayLast<A>(array: A[]): A {
  return array[array.length - 1];
}

function suffixToNode<A>(suffix: Affix<A>): Node {
  return new Node(undefined, suffix.array);
}

function setSizes(node: Node, height: number): Node {
  let sum = 0;
  const sizeTable = [];
  for (let i = 0; i < node.array.length; ++i) {
    sum += sizeOfSubtree(node.array[i], height - 1);
    sizeTable[i] = sum;
  }
  node.sizes = sizeTable;
  return node;
}

/**
 * Returns the number of elements stored in the node.
 */
function sizeOfSubtree(node: Node, height: number): number {
  if (height !== 0) {
    if (node.sizes !== undefined) {
      return arrayLast(node.sizes);
    } else {
      // the node is leftwise dense so all all but the last child are full
      const lastSize = sizeOfSubtree(arrayLast(node.array), height - 1);
      return ((node.array.length - 1) << (height * bits)) + lastSize;
    }
  } else {
    return node.array.length;
  }
}

export class Affix<A> {
  constructor(
    public owned: boolean,
    public array: A[]
  ) { }
}

function affixPush<A>(a: A, { owned, array }: Affix<A>): Affix<A> {
  if (owned === true) {
    owned = false;
    array.push(a);
    return new Affix(true, array);
  } else {
    const newArray = copyArray(array);
    newArray.push(a);
    return new Affix(true, newArray);
  }
}

export class List<A> {
  constructor(
    public depth: number,
    public length: number,
    public root: Node,
    public suffix: Affix<A>,
    public suffixSize: number
  ) { }
  space(): number {
    return (branchingFactor ** (this.depth + 1)) - (this.length - this.suffixSize);
  }
  [Symbol.iterator](): Iterator<A> {
    return new ListIterator(this);
  }
  "fantasy-land/map"<B>(f: (a: A) => B): List<B> {
    return map(f, this);
  }
  append(value: A): List<A> {
    if (this.suffixSize < 32) {
      return new List<A>(
        this.depth,
        this.length + 1,
        this.root,
        affixPush(value, this.suffix),
        this.suffixSize + 1
      );
    }
    const newSuffix = new Affix(true, [value]);
    const suffixNode = suffixToNode(this.suffix);
    if (this.length === 32) {
      return new List<A>(
        0, this.length + 1, suffixNode, newSuffix, 1
      );
    }
    const full = this.space() === 0;
    let node;
    if (full) {
      if (this.depth === 0) {
        node = new Node(undefined, [this.root, suffixNode]);
      } else {
        node = new Node(undefined, [this.root, createPath(this.depth - 1, suffixNode)]);
      }
    } else {
      node = this.root.update(this.depth - 1, (this.length - 1) >> 5, suffixNode);
    }
    return new List<A>(
      this.depth + (full ? 1 : 0), this.length + 1, node, newSuffix, 1
    );
  }
  nth(index: number): A | undefined {
    return nth(index, this);
  }
  static empty(): List<any> {
    return new List(0, 0, undefined, new Affix(true, []), 0);
  }
}

function cloneList<A>(list: List<A>): List<A> {
  return new List(list.depth, list.length, list.root, list.suffix, list.suffixSize);
}

const iteratorDone: IteratorResult<any> = { done: true, value: undefined };

class ListIterator<A> implements Iterator<A> {
  stack: any[][];
  indices: number[];
  constructor(private list: List<A>) {
    // this.nodeIdx = 0;
    this.stack = [];
    this.indices = [];
    if (list.root !== undefined) {
      let currentNode = list.root.array;
      for (let i = 0; i < list.depth + 1; ++i) {
        this.stack.push(currentNode);
        this.indices.push(0);
        currentNode = arrayFirst(currentNode).array;
      }
      this.indices[this.indices.length - 1] = -1;
    } else {
      this.indices.push(-1);
    }
  }
  goUp(): void {
    this.stack.pop();
    this.indices.pop();
  }
  remaining(): number {
    const node = arrayLast(this.stack);
    const idx = arrayLast(this.indices);
    return node.length - idx - 1;
  }
  incrementIndex(): number {
    return ++this.indices[this.indices.length - 1];
  }
  nextInTree(): void {
    while (this.remaining() === 0) {
      this.goUp();
      if (this.stack.length === 0) {
        return;
      }
    }
    this.incrementIndex();
    for (let i = this.indices.length - 1; i < this.list.depth; ++i) {
      this.stack.push(arrayLast(this.stack)[arrayLast(this.indices)].array);
      this.indices.push(0);
    }
  }
  next(): IteratorResult<A> {
    if (this.stack.length !== 0) {
      this.nextInTree();
      if (this.stack.length !== 0) {
        const leaf = arrayLast(this.stack);
        const idx = arrayLast(this.indices);
        const value = leaf[idx];
        return { done: false, value };
      } else {
        this.indices.push(-1);
      }
    }
    if (this.indices[0] < this.list.suffixSize - 1) {
      const idx = this.incrementIndex();
      return { done: false, value: this.list.suffix.array[idx] };
    }
    return iteratorDone;
  }
}

export function append<A>(element: A, list: List<A>): List<A> {
  return list.append(element);
}

export function list<A>(...elements: A[]): List<A> {
  let l = empty();
  for (const element of elements) {
    l = append(element, l);
  }
  return l;
}

export function pair<A>(first: A, second: A): List<A> {
  return new List(0, 2, undefined, new Affix(false, [first, second]), 2);
}

export function empty(): List<any> {
  return List.empty();
}

export function length(l: List<any>): number {
  return l.length;
}

export function last(l: List<any>): number {
  return l.length === 0 ? undefined : arrayLast(l.suffix.array);
}

export function nth<A>(index: number, list: List<A>): A | undefined {
  if (index >= list.length - list.suffixSize) {
    return list.suffix.array[index - (list.length - list.suffixSize)];
  }
  return list.root.sizes === undefined ? nodeNthDense(list.root, list.depth, index) : nodeNth(list.root, list.depth, index);
}

// map

export function mapArray<A, B>(
  f: (a: A) => B, array: A[]
): B[] {
  const result = new Array(array.length);
  for (let i = 0; i < array.length; ++i) {
    result[i] = f(array[i]);
  }
  return result;
}

function mapNode<A, B>(
  f: (a: A) => B, node: Node, depth: number
): Node {
  if (depth !== 0) {
    const { array } = node;
    const result = new Array(array.length);
    for (let i = 0; i < array.length; ++i) {
      result[i] = mapNode(f, array[i], depth - 1);
    }
    return new Node(node.sizes, result);
  } else {
    return new Node(undefined, mapArray(f, node.array));
  }
}

function mapSuffix<A, B>(
  f: (a: A) => B, suffix: Affix<A>, length: number
): Affix<B> {
  return new Affix(true, mapArray(f, suffix.array));
}

export function map<A, B>(f: (a: A) => B, l: List<A>): List<B> {
  return new List(
    l.depth, l.length,
    l.root === undefined ? undefined : mapNode(f, l.root, l.depth),
    mapSuffix(f, l.suffix, l.suffixSize),
    l.suffixSize
  );
}

export function range(start: number, end: number): List<number> {
  let list = empty();
  for (let i = start; i < end; ++i) {
    list = list.append(i);
  }
  return list;
}

// fold

export function foldlArray<A, B>(
  f: (acc: B, value: A) => B, initial: B, array: A[]
): B {
  let acc = initial;
  for (let i = 0; i < array.length; ++i) {
    acc = f(acc, array[i]);
  }
  return acc;
}

function foldlNode<A, B>(
  f: (acc: B, value: A) => B, initial: B, node: Node, depth: number
): B {
  const { array } = node;
  if (depth === 0) {
    return foldlArray(f, initial, array);
  }
  let acc = initial;
  for (let i = 0; i < array.length; ++i) {
    acc = foldlNode(f, acc, array[i], depth - 1);
  }
  return acc;
}

export function foldl<A, B>(f: (acc: B, value: A) => B, initial: B, l: List<A>): B {
  const foldedSuffix = foldlArray(f, initial, l.suffix.array);
  return l.root === undefined ? foldedSuffix : foldlNode(f, foldedSuffix, l.root, l.depth);
}

export const reduce = foldl;

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
    while (sizes[i] > branchingFactor - (eMax / 2)) {
      // Skip nodes that are already sufficiently balanced
      ++i;
    }
    let remaining = sizes[i]; // number of elements to re-distribute
    while (remaining > 0) {
      const size = Math.min(remaining + sizes[i + 1], branchingFactor);
      sizes[i] = size;
      remaining = remaining - (size - sizes[i + 1]);
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

function concatNodeMerge<A>(left: Node, center: Node, right: Node): Node[] {
  const array = [];
  if (left !== undefined) {
    for (let i = 0; i < left.array.length - 1; ++i) {
      array.push(left.array[i]);
    }
  }
  for (let i = 0; i < center.array.length; ++i) {
    array.push(center.array[i]);
  }
  if (right !== undefined) {
    for (let i = 1; i < right.array.length; ++i) {
      array.push(right.array[i]);
    }
  }
  return array;
}

function executeConcatPlan(merged: Node[], plan: number[], height: number): any[] {
  const result = [];
  let sourceIdx = 0; // the current node we're copying from
  let offset = 0; // elements in source already used
  for (let toMove of plan) {
    let source = merged[sourceIdx].array;
    if (toMove === source.length && offset === 0) {
      // source matches target exactly, reuse source
      result.push(merged[sourceIdx]);
      ++sourceIdx;
    } else {
      const node = new Node(undefined, []);
      while (toMove > 0) {
        const available = source.length - offset;
        const itemsToCopy = Math.min(toMove, available);
        pushElements(source, node.array, offset, itemsToCopy);
        if (toMove >= available) {
          ++sourceIdx;
          source = merged[sourceIdx].array;
          offset = 0;
        } else {
          offset += itemsToCopy;
        }
        toMove -= itemsToCopy;
      }
      if (height > 1) {
        // Set sizes on children unless their leaf nodes
        setSizes(node, height - 1);
      }
      result.push(node);
    }
  }
  return result;
}

function rebalance<A>(
  left: Node, center: Node, right: Node, height: number, top: boolean
): Node {
  const merged = concatNodeMerge(left, center, right);
  const plan = createConcatPlan(merged);
  const balanced =
    plan !== undefined ? executeConcatPlan(merged, plan, height) : merged;
  if (balanced.length < branchingFactor) {
    if (top === false) {
      // Return a single node with extra height for balancing at next
      // level
      return new Node(undefined, [setSizes(new Node(undefined, balanced), height)]);
    } else {
      return new Node(undefined, balanced);
    }
  } else {
    return new Node(undefined, [
      setSizes(new Node(undefined, balanced.slice(0, branchingFactor)), height),
      setSizes(new Node(undefined, balanced.slice(branchingFactor)), height)
    ]);
  }
}

function concatSubTree<A>(
  left: Node, lDepth: number, right: Node, rDepth: number, isTop: boolean
): Node {
  if (lDepth > rDepth) {
    const c = concatSubTree(arrayLast(left.array), lDepth - 1, right, rDepth, false);
    return rebalance(left, c, undefined, lDepth, isTop);
  } else if (lDepth < rDepth) {
    const c = concatSubTree(left, lDepth, arrayFirst(right.array), rDepth - 1, false);
    return rebalance(undefined, c, right, rDepth, isTop);
  } else if (lDepth === 0) {
    if (isTop && left.array.length + right.array.length <= branchingFactor) {
      return new Node(undefined, [new Node(undefined, left.array.concat(right.array))]);
    } else {
      return new Node(undefined, [left, right]);
    }
  } else {
    const c = concatSubTree<A>(
      arrayLast(left.array),
      lDepth - 1,
      arrayFirst(right.array),
      rDepth - 1,
      false
    );
    return rebalance(left, c, right, lDepth, isTop);
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
  newSuffix: Affix<A>,
  newSuffixSize: number
): List<A> {
  // install the new suffix in location
  newList.suffix = newSuffix;
  newList.suffixSize = newSuffixSize;
  if (oldList.length <= branchingFactor) {
    // The old tree has no content in tree, all content is in affixes
    newList.root = suffixNode;
    return newList;
  }
  let index = oldList.length - 1;
  let nodesToCopy = 0;
  let nodesVisited = 0;
  let pos = 0;
  let shift = oldList.depth * 5;
  let currentNode = oldList.root;
  if (32 ** (oldList.depth + 1) < index) {
    shift = 0; // there is no room
    nodesVisited = oldList.depth;
  }
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
    const newPath = nodesVisited === 0
      ? suffixNode
      : createPath(nodesVisited - 1, suffixNode);
    const newRoot = new Node(undefined, [newList.root, newPath]);
    newList.root = newRoot;
    newList.depth++;
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
  let current = new Node(undefined, []);
  node.array.push(current);
  for (let i = 1; i < depth; ++i) {
    let newNode = new Node(undefined, []);
    current.array[0] = newNode;
    current = newNode;
  }
  return current;
}

export function concat<A>(left: List<A>, right: List<A>): List<A> {
  if (left.length === 0) {
    return right;
  } else if (right.length === 0) {
    return left;
  } else if (right.root === undefined) {
    // right is nothing but a suffix
    if (right.suffixSize + left.suffixSize <= branchingFactor) {
      // the two suffixes can be combined into one
      return new List(
        right.depth,
        left.length + right.length,
        left.root,
        new Affix(true, left.suffix.array.concat(right.suffix.array)),
        left.suffixSize + right.length
      );
    } else if (left.suffixSize === branchingFactor) {
      // left suffix is full and can be pushed down
      const newList = cloneList(left);
      newList.length += right.length;
      return pushDownTail(left, newList, suffixToNode(newList.suffix), right.suffix, right.suffixSize);
    } else {
      // we must merge the two suffixes and push down
      const newList = cloneList(left);
      newList.length += right.length;
      const newNode = new Node(undefined, []);
      const leftSize = left.suffixSize;
      copyIndices(left.suffix.array, 0, newNode.array, 0, left.suffixSize);
      const rightSize = branchingFactor - leftSize;
      copyIndices(right.suffix.array, 0, newNode.array, leftSize, rightSize);
      const newSuffixSize = right.suffixSize - rightSize;
      const newSuffix = new Affix(true, right.suffix.array.slice(rightSize));
      return pushDownTail(left, newList, newNode, newSuffix, newSuffixSize);
    }
  } else {
    const newSize = left.length + right.length;
    const newLeft = pushDownTail(left, cloneList(left), suffixToNode(left.suffix), undefined, 0);
    const newNode = concatSubTree(newLeft.root, newLeft.depth, right.root, right.depth, true);
    const newHeight = getHeight(newNode);
    setSizes(newNode, newHeight);
    return new List(newHeight, newSize, newNode, right.suffix, right.suffixSize);
  }
}
