const branchingFactor = 32;
const branchBits = 5;
const mask = 31;

let elementEquals = (a: any, b: any) => {
  return a === b;
};

export function setEquals(equals: (a: any, b: any) => boolean): void {
  elementEquals = equals;
}

function createPath(depth: number, value: any): any {
  let current = value;
  for (let i = 0; i < depth; ++i) {
    current = new Node(undefined, [current]);
  }
  return current;
}

// Array helper functions

function copyArray(source: any[]): any[] {
  const array = [];
  for (let i = 0; i < source.length; ++i) {
    array[i] = source[i];
  }
  return array;
}

function pushElements<A>(
  source: A[],
  target: A[],
  offset: number,
  amount: number
): void {
  for (let i = offset; i < offset + amount; ++i) {
    target.push(source[i]);
  }
}

function copyIndices(
  source: any[],
  sourceStart: number,
  target: any[],
  targetStart: number,
  length: number
): void {
  for (let i = 0; i < length; ++i) {
    target[targetStart + i] = source[sourceStart + i];
  }
}

function arrayPrepend<A>(value: A, array: A[]): A[] {
  const newLength = array.length + 1;
  const result = new Array(newLength);
  result[0] = value;
  for (let i = 1; i < newLength; ++i) {
    result[i] = array[i - 1];
  }
  return result;
}

/**
 * Prepends an element to a node
 */
function nodePrepend(value: any, size: number, node: Node): Node {
  const array = arrayPrepend(value, node.array);
  let sizes = undefined;
  if (node.sizes !== undefined) {
    sizes = new Array(node.sizes.length + 1);
    sizes[0] = size;
    for (let i = 0; i < node.sizes.length; ++i) {
      sizes[i + 1] = node.sizes[i] + size;
    }
  }
  return new Node(sizes, array);
}

/**
 * Create a reverse _copy_ of an array.
 */
function reverseArray<A>(array: A[]): A[] {
  return array.slice().reverse();
}

function arrayFirst<A>(array: A[]): A {
  return array[0];
}

function arrayLast<A>(array: A[]): A {
  return array[array.length - 1];
}

function updateNode(
  node: Node,
  depth: number,
  index: number,
  offset: number,
  value: any
): Node {
  const curOffset = (offset >> (depth * branchBits)) & mask;
  let path = ((index >> (depth * branchBits)) & mask) - curOffset;
  if (node.sizes !== undefined) {
    while (node.sizes[path] <= index) {
      path++;
    }
    const traversed = path === 0 ? 0 : node.sizes[path - 1];
    index -= traversed;
  }
  let array;
  if (path < 0) {
    // TOOD: Once `prepend` no longer uses `update` this should be removed
    array = arrayPrepend(createPath(depth, value), node.array);
  } else {
    array = copyArray(node.array);
    if (depth === 0) {
      array[path] = value;
    } else {
      array[path] = updateNode(
        array[path],
        depth - 1,
        index,
        path === 0 ? offset : 0,
        value
      );
    }
  }
  return new Node(node.sizes, array);
}

export type Sizes = number[] | undefined;

export class Node {
  constructor(public sizes: Sizes, public array: any[]) {}
}

function nodeNthDense(node: Node, depth: number, index: number): any {
  let current = node;
  for (; depth >= 0; --depth) {
    current = current.array[(index >> (depth * branchBits)) & mask];
  }
  return current;
}

function handleOffset(depth: number, offset: number, index: number): number {
  index += offset;
  for (; depth >= 0; --depth) {
    index = index - (offset & (mask << (depth * branchBits)));
    if (((index >> (depth * branchBits)) & mask) !== 0) {
      break;
    }
  }
  return index;
}

function nodeNth(node: Node, depth: number, index: number): any {
  let path;
  let current = node;
  while (current.sizes !== undefined) {
    path = (index >> (depth * branchBits)) & mask;
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

export function nth<A>(index: number, l: List<A>): A {
  const prefixSize = getPrefixSize(l);
  const suffixSize = getSuffixSize(l);
  const { offset } = l;
  if (index < prefixSize) {
    return l.prefix[prefixSize - index - 1];
  } else if (index >= l.length - suffixSize) {
    return l.suffix[index - (l.length - suffixSize)];
  }
  const depth = getDepth(l);
  return l.root!.sizes === undefined
    ? nodeNthDense(
        l.root!,
        depth,
        offset === 0
          ? index - prefixSize
          : handleOffset(depth, offset, index - prefixSize)
      )
    : nodeNth(l.root!, depth, index - prefixSize);
}

function cloneNode({ sizes, array }: Node): Node {
  return new Node(
    sizes === undefined ? undefined : copyArray(sizes),
    copyArray(array)
  );
}

function suffixToNode<A>(suffix: A[]): Node {
  // FIXME: should take size and copy
  return new Node(undefined, suffix);
}

function prefixToNode<A>(prefix: A[]): Node {
  // FIXME: should take size and copy
  return new Node(undefined, prefix.reverse());
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
      return ((node.array.length - 1) << (height * branchBits)) + lastSize;
    }
  } else {
    return node.array.length;
  }
}

// This array should not be mutated. Thus a dummy element is placed in
// it. Thus the affix will not be owned and thus not mutated.
const emptyAffix: any[] = [0];

function affixPush<A>(a: A, array: A[], length: number): A[] {
  if (array.length === length) {
    array.push(a);
    return array;
  } else {
    const newArray: A[] = [];
    copyIndices(array, 0, newArray, 0, length);
    newArray.push(a);
    return newArray;
  }
}

// We store a bit field in list. From right to left, the first five
// bits are suffix length, the next five are prefix length and the
// rest is depth. The functions below are for working with the bits in
// a sane way.

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

function setPrefix(size: number, bits: number): number {
  return (size << affixBits) | (bits & ~(affixMask << affixBits));
}

function setSuffix(size: number, bits: number): number {
  return size | (bits & ~affixMask);
}

function setDepth(depth: number, bits: number): number {
  return (
    (depth << (affixBits * 2)) | (bits & (affixMask | (affixMask << affixBits)))
  );
}

function incrementPrefix(bits: number): number {
  return bits + (1 << affixBits);
}

function incrementSuffix(bits: number): number {
  return bits + 1;
}

function incrementDepth(bits: number): number {
  return bits + (1 << (affixBits * 2));
}

function decrementDepth(bits: number): number {
  return bits - (1 << (affixBits * 2));
}

function createBits(
  depth: number,
  prefixSize: number,
  suffixSize: number
): number {
  return (depth << (affixBits * 2)) | (prefixSize << affixBits) | suffixSize;
}

/*
 * Invariants that any list `l` should satisfy
 *
 * 1. If `l.root !== undefined` then `getSuffixSize(l) !== 0` and
 *   `getPrefixSize(l) !== 0`. The invariant ensures that `first` and
 *   `last` never have to look in the root and that they therefore
 *   take O(1) time.
 * 2. If a tree or sub-tree does not have a size-table then all leaf
      nodes in the tree are of size 32.
 */
export class List<A> {
  constructor(
    public bits: number,
    public offset: number,
    public length: number,
    public root: Node | undefined,
    public suffix: A[],
    public prefix: A[]
  ) {}
  [Symbol.iterator](): Iterator<A> {
    return new ListIterator(this);
  }
}

function cloneList<A>(l: List<A>): List<A> {
  return new List(l.bits, l.offset, l.length, l.root, l.suffix, l.prefix);
}

class ListIterator<A> implements Iterator<A> {
  stack: any[][];
  indices: number[];
  idx: number;
  prefixSize: number;
  middleSize: number;
  result: IteratorResult<A> = { done: false, value: undefined as any };
  constructor(private l: List<A>) {
    this.idx = -1;
    this.prefixSize = getPrefixSize(l);
    this.middleSize = l.length - getSuffixSize(l);
    if (l.root !== undefined) {
      const depth = getDepth(l);
      this.stack = new Array(depth + 1);
      this.indices = new Array(depth + 1);
      let currentNode = l.root.array;
      for (let i = depth; 0 <= i; --i) {
        this.stack[i] = currentNode;
        this.indices[i] = 0;
        currentNode = currentNode[0].array;
      }
      this.indices[0] = -1;
    }
  }
  nextInTree(): void {
    let i = 0;
    while (++this.indices[i] === this.stack[i].length) {
      this.indices[i] = 0;
      ++i;
    }
    for (; 0 < i; --i) {
      this.stack[i - 1] = this.stack[i][this.indices[i]].array;
    }
  }
  next(): IteratorResult<A> {
    let newVal;
    const idx = ++this.idx;
    if (idx < this.prefixSize) {
      newVal = this.l.prefix[this.prefixSize - idx - 1];
    } else if (idx < this.middleSize) {
      this.nextInTree();
      newVal = this.stack[0][this.indices[0]];
    } else if (idx < this.l.length) {
      newVal = this.l.suffix[idx - this.middleSize];
    } else {
      this.result.done = true;
    }
    this.result.value = newVal;
    return this.result;
  }
}

// prepend & append

export function prepend<A>(value: A, l: List<A>): List<A> {
  const prefixSize = getPrefixSize(l);
  if (prefixSize < 32) {
    return new List<A>(
      incrementPrefix(l.bits),
      l.offset,
      l.length + 1,
      l.root,
      l.suffix,
      affixPush(value, l.prefix, prefixSize)
    );
  } else {
    const newList = cloneList(l);
    prependNodeToTree(newList, reverseArray(l.prefix));
    const newPrefix = [value];
    newList.prefix = newPrefix;
    newList.length++;
    newList.bits = setPrefix(1, newList.bits);
    return newList;
  }
}

/**
 * Traverses down the left edge of the tree and copies k nodes.
 * Returns the last copied node.
 * @param l
 * @param k The number of nodes to copy. Will always be at least 1.
 * @param leafSize The number of elements in the leaf that will be
 * inserted.
 */
function copyLeft(l: List<any>, k: number, leafSize: number): Node {
  let currentNode = cloneNode(l.root!); // copy root
  l.root = currentNode; // install copy of root

  for (let i = 1; i < k; ++i) {
    const index = 0; // go left
    if (currentNode.sizes !== undefined) {
      for (let i = 0; i < currentNode.sizes.length; ++i) {
        currentNode.sizes[i] += leafSize;
      }
    }
    const newNode = cloneNode(currentNode.array[index]);
    // Install the copied node
    currentNode.array[index] = newNode;
    currentNode = newNode;
  }
  return currentNode;
}

function prependSizes(n: number, sizes: Sizes): Sizes {
  if (sizes === undefined) {
    return undefined;
  } else {
    const newSizes = new Array(sizes.length + 1);
    newSizes[0] = n;
    for (let i = 0; i < sizes.length; ++i) {
      newSizes[i + 1] = sizes[i] + n;
    }
    return newSizes;
  }
}

/**
 * Prepends a node to a tree. Either by shifting the nodes in the root
 * left or by increasing the height
 */
function prependTopTree<A>(l: List<A>, depth: number, node: Node) {
  let newOffset;
  if (l.root!.array.length < branchingFactor) {
    // There is space in the root
    newOffset = 32 ** depth - 32;
    l.root = new Node(
      prependSizes(32, l.root!.sizes),
      arrayPrepend(createPath(depth - 1, node), l.root!.array)
    );
  } else {
    // We need to create a new root
    l.bits = incrementDepth(l.bits);
    const sizes =
      l.root!.sizes === undefined
        ? undefined
        : [32, arrayLast(l.root!.sizes!) + 32];
    newOffset = depth === 0 ? 0 : 32 ** (depth + 1) - 32;
    l.root = new Node(sizes, [createPath(depth, node), l.root]);
  }
  return newOffset;
}

/**
 * Takes a RRB-tree and a node tail. It then prepends the node to the
 * tree.
 * @param l The subject for prepending. `l` will be mutated. Nodes in
 * the tree will _not_ be mutated.
 * @param node The node that should be prepended to the tree.
 */
function prependNodeToTree<A>(l: List<A>, array: A[]): List<A> {
  if (l.root === undefined) {
    if (getSuffixSize(l) === 0) {
      // ensure invariant 1
      l.bits = setSuffix(array.length, l.bits);
      l.suffix = array;
    } else {
      l.root = new Node(undefined, array);
    }
    return l;
  } else {
    const node = new Node(undefined, array);
    const depth = getDepth(l);
    let newOffset = 0;
    if (l.root.sizes === undefined) {
      if (l.offset !== 0) {
        newOffset = l.offset - branchingFactor;
        l.root = prependDense(
          l.root,
          depth - 1,
          (l.offset - 1) >> 5,
          l.offset >> 5,
          node
        );
      } else {
        // in this case we can be sure that the is not room in the tree
        // for the new node
        newOffset = prependTopTree(l, depth, node);
      }
    } else {
      // represents how many nodes _with size-tables_ that we should copy.
      let copyableCount = 0;
      // go down while there is size tables
      let nodesTraversed = 0;
      let currentNode = l.root;
      while (currentNode.sizes !== undefined && nodesTraversed < depth) {
        ++nodesTraversed;
        if (currentNode.array.length < 32) {
          // there is room if offset is > 0 or if the first node does not
          // contain as many nodes as it possibly can
          copyableCount = nodesTraversed;
        }
        currentNode = currentNode.array[0];
      }
      if (l.offset !== 0) {
        const copiedNode = copyLeft(l, nodesTraversed, 32);
        for (let i = 0; i < copiedNode.sizes!.length; ++i) {
          copiedNode.sizes![i] += branchingFactor;
        }
        copiedNode.array[0] = prependDense(
          copiedNode.array[0],
          depth - nodesTraversed - 1,
          (l.offset - 1) >> 5,
          l.offset >> 5,
          node
        );
        l.offset = l.offset - branchingFactor;
        return l;
      } else {
        if (copyableCount === 0) {
          l.offset = prependTopTree(l, depth, node);
        } else {
          let parent: Node | undefined;
          let prependableNode: Node;
          // Copy the part of the path with size tables
          if (copyableCount > 1) {
            parent = copyLeft(l, copyableCount - 1, 32);
            prependableNode = parent.array[0];
          } else {
            parent = undefined;
            prependableNode = l.root!;
          }
          const path = createPath(depth - copyableCount, node);
          // add offset
          l.offset = 32 ** (depth - copyableCount + 1) - 32;
          const prepended = nodePrepend(path, 32, prependableNode);
          if (parent === undefined) {
            l.root = prepended;
          } else {
            parent.array[0] = prepended;
          }
        }
        return l;
      }
    }
    l.offset = newOffset;
    return l;
  }
}

function prependDense(
  node: Node,
  depth: number,
  index: number,
  offset: number,
  value: any
): Node {
  const curOffset = (offset >> (depth * branchBits)) & mask;
  let path = ((index >> (depth * branchBits)) & mask) - curOffset;
  let array;
  if (path < 0) {
    array = arrayPrepend(createPath(depth, value), node.array);
  } else {
    array = copyArray(node.array);
    if (depth === 0) {
      array[path] = value;
    } else {
      array[path] = updateNode(
        array[path],
        depth - 1,
        index,
        path === 0 ? offset : 0,
        value
      );
    }
  }
  return new Node(node.sizes, array);
}

export function append<A>(value: A, l: List<A>): List<A> {
  const suffixSize = getSuffixSize(l);
  if (suffixSize < 32) {
    return new List(
      incrementSuffix(l.bits),
      l.offset,
      l.length + 1,
      l.root,
      affixPush(value, l.suffix, suffixSize),
      l.prefix
    );
  }
  const newSuffix = [value];
  const suffixNode = suffixToNode(l.suffix);
  const newList = cloneList(l);
  appendNodeToTree(newList, suffixNode);
  newList.suffix = newSuffix;
  newList.length++;
  newList.bits = setSuffix(1, newList.bits);
  return newList;
}

export function list<A>(...elements: A[]): List<A> {
  let l = empty();
  for (const element of elements) {
    l = append(element, l);
  }
  return l;
}

export function of<A>(a: A): List<A> {
  return list(a);
}

export function pair<A>(first: A, second: A): List<A> {
  return new List(2, 0, 2, undefined, [first, second], emptyAffix);
}

export function empty(): List<any> {
  return new List(0, 0, 0, undefined, emptyAffix, emptyAffix);
}

export function repeat<A>(value: A, times: number): List<A> {
  let l = empty();
  while (--times >= 0) {
    l = append(value, l);
  }
  return l;
}

/**
 * Generates a new list by calling a function with the current index n times.
 *
 * @param func Function used to generate list values.
 * @param times Number of values to generate.
 */
export function times<A>(func: (index: number) => A, times: number): List<A> {
  let l = empty();
  for (let i = 0; i < times; i++) {
    l = append(func(i), l);
  }
  return l;
}

export function length(l: List<any>): number {
  return l.length;
}

export function first<A>(l: List<A>): A | undefined {
  if (getPrefixSize(l) !== 0) {
    return arrayLast(l.prefix);
  } else if (getSuffixSize(l) !== 0) {
    return arrayFirst(l.suffix);
  }
}

export function last<A>(l: List<A>): A | undefined {
  if (getSuffixSize(l) !== 0) {
    return arrayLast(l.suffix);
  } else if (getPrefixSize(l) !== 0) {
    return arrayFirst(l.prefix);
  }
}

// map

function mapArray<A, B>(f: (a: A) => B, array: A[]): B[] {
  const result = new Array(array.length);
  for (let i = 0; i < array.length; ++i) {
    result[i] = f(array[i]);
  }
  return result;
}

function mapNode<A, B>(f: (a: A) => B, node: Node, depth: number): Node {
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

function mapAffix<A, B>(f: (a: A) => B, suffix: A[], length: number): B[] {
  const newSuffix = new Array(length);
  for (let i = 0; i < length; ++i) {
    newSuffix[i] = f(suffix[i]);
  }
  return newSuffix;
}

export function map<A, B>(f: (a: A) => B, l: List<A>): List<B> {
  return new List(
    l.bits,
    l.offset,
    l.length,
    l.root === undefined ? undefined : mapNode(f, l.root, getDepth(l)),
    mapAffix(f, l.suffix, getSuffixSize(l)),
    mapAffix(f, l.prefix, getPrefixSize(l))
  );
}

export function pluck<A, K extends keyof A>(key: K, l: List<A>): List<A[K]> {
  return map(a => a[key], l);
}

export function range(start: number, end: number): List<number> {
  let list = empty();
  for (let i = start; i < end; ++i) {
    list = append(i, list);
  }
  return list;
}

// fold

function foldlSuffix<A, B>(
  f: (acc: B, value: A) => B,
  acc: B,
  array: A[],
  length: number
): B {
  for (let i = 0; i < length; ++i) {
    acc = f(acc, array[i]);
  }
  return acc;
}

function foldlPrefix<A, B>(
  f: (acc: B, value: A) => B,
  acc: B,
  array: A[],
  length: number
): B {
  for (let i = length - 1; 0 <= i; --i) {
    acc = f(acc, array[i]);
  }
  return acc;
}

function foldlNode<A, B>(
  f: (acc: B, value: A) => B,
  acc: B,
  node: Node,
  depth: number
): B {
  const { array } = node;
  if (depth === 0) {
    return foldlSuffix(f, acc, array, array.length);
  }
  for (let i = 0; i < array.length; ++i) {
    acc = foldlNode(f, acc, array[i], depth - 1);
  }
  return acc;
}

export function foldl<A, B>(
  f: (acc: B, value: A) => B,
  initial: B,
  l: List<A>
): B {
  const suffixSize = getSuffixSize(l);
  const prefixSize = getPrefixSize(l);
  initial = foldlPrefix(f, initial, l.prefix, prefixSize);
  if (l.root !== undefined) {
    initial = foldlNode(f, initial, l.root, getDepth(l));
  }
  return foldlSuffix(f, initial, l.suffix, suffixSize);
}

export const reduce = foldl;

export function forEach<A>(callback: (a: A) => void, l: List<A>): void {
  foldl((_, element) => callback(element), undefined as void, l);
}

export function filter<A>(predicate: (a: A) => boolean, l: List<A>): List<A> {
  return foldl((acc, a) => (predicate(a) ? append(a, acc) : acc), empty(), l);
}

export function reject<A>(predicate: (a: A) => boolean, l: List<A>): List<A> {
  return foldl((acc, a) => (predicate(a) ? acc : append(a, acc)), empty(), l);
}

export function partition<A>(
  predicate: (a: A) => boolean,
  l: List<A>
): List<List<A>> {
  const { fst, snd } = foldl(
    (obj, a) => (
      predicate(a)
        ? (obj.fst = append(a, obj.fst))
        : (obj.snd = append(a, obj.snd)),
      obj
    ),
    { fst: empty(), snd: empty() },
    l
  );
  return pair(fst, snd);
}

export function join(separator: string, l: List<string>): string {
  return foldl((a, b) => (a.length === 0 ? b : a + separator + b), "", l);
}

function foldrSuffix<A, B>(
  f: (value: A, acc: B) => B,
  initial: B,
  array: A[],
  length: number
): B {
  let acc = initial;
  for (let i = length - 1; 0 <= i; --i) {
    acc = f(array[i], acc);
  }
  return acc;
}

function foldrPrefix<A, B>(
  f: (value: A, acc: B) => B,
  initial: B,
  array: A[],
  length: number
): B {
  let acc = initial;
  for (let i = 0; i < length; ++i) {
    acc = f(array[i], acc);
  }
  return acc;
}

function foldrNode<A, B>(
  f: (value: A, acc: B) => B,
  initial: B,
  { array }: Node,
  depth: number
): B {
  if (depth === 0) {
    return foldrSuffix(f, initial, array, array.length);
  }
  let acc = initial;
  for (let i = array.length - 1; 0 <= i; --i) {
    acc = foldrNode(f, acc, array[i], depth - 1);
  }
  return acc;
}

export function foldr<A, B>(
  f: (value: A, acc: B) => B,
  initial: B,
  l: List<A>
): B {
  const suffixSize = getSuffixSize(l);
  const prefixSize = getPrefixSize(l);
  let acc = foldrSuffix(f, initial, l.suffix, suffixSize);
  if (l.root !== undefined) {
    acc = foldrNode(f, acc, l.root, getDepth(l));
  }
  return foldrPrefix(f, acc, l.prefix, prefixSize);
}

export const reduceRight = foldr;

export function ap<A, B>(listF: List<(a: A) => B>, l: List<A>): List<B> {
  return flatten(map(f => map(f, l), listF));
}

export function flatten<A>(nested: List<List<A>>): List<A> {
  return foldl<List<A>, List<A>>(concat, empty(), nested);
}

export function chain<A, B>(f: (a: A) => List<B>, l: List<A>): List<B> {
  return flatten(map(f, l));
}

// callback fold

type FoldCb<Input, State> = (input: Input, state: State) => boolean;

function foldlSuffixCb<A, B>(
  cb: FoldCb<A, B>,
  state: B,
  array: A[],
  length: number
): boolean {
  for (var i = 0; i < length && cb(array[i], state); ++i) {}
  return i === length;
}

function foldlPrefixCb<A, B>(
  cb: FoldCb<A, B>,
  state: B,
  array: A[],
  length: number
): boolean {
  for (var i = length - 1; 0 <= i && cb(array[i], state); --i) {}
  return i === -1;
}

function foldlNodeCb<A, B>(
  cb: FoldCb<A, B>,
  state: B,
  node: Node,
  depth: number
): boolean {
  const { array } = node;
  if (depth === 0) {
    return foldlSuffixCb(cb, state, array, array.length);
  }
  for (
    var i = 0;
    i < array.length && foldlNodeCb(cb, state, array[i], depth - 1);
    ++i
  ) {}
  return i === array.length;
}

/**
 * This function is a lot like a fold. But the reducer function is
 * supposed to mutate its state instead of returning it. Instead of
 * returning a new state it returns a boolean that tells wether or not
 * to continue the fold. `true` indicates that the folding should
 * continue.
 */
function foldlCb<A, B>(cb: FoldCb<A, B>, state: B, l: List<A>): B {
  const suffixSize = getSuffixSize(l);
  const prefixSize = getPrefixSize(l);
  if (foldlPrefixCb(cb, state, l.prefix, prefixSize)) {
    if (l.root !== undefined) {
      if (foldlNodeCb(cb, state, l.root, getDepth(l))) {
        foldlSuffixCb(cb, state, l.suffix, suffixSize);
      }
    } else {
      foldlSuffixCb(cb, state, l.suffix, suffixSize);
    }
  }
  return state;
}

// functions based on foldlCb

type PredState = {
  predicate: (a: any) => boolean;
  result: any;
};

function everyCb<A>(value: A, state: any): boolean {
  return (state.result = state.predicate(value));
}

export function every<A>(predicate: (a: A) => boolean, l: List<A>): boolean {
  return foldlCb<A, PredState>(everyCb, { predicate, result: true }, l).result;
}

export const all = every;

function someCb<A>(value: A, state: any): boolean {
  return !(state.result = state.predicate(value));
}

export function some<A>(predicate: (a: A) => boolean, l: List<A>): boolean {
  return foldlCb<A, PredState>(someCb, { predicate, result: false }, l).result;
}

// tslint:disable-next-line:variable-name
export const any = some;

export function none<A>(predicate: (a: A) => boolean, l: List<A>): boolean {
  return !some(predicate, l);
}

function findCb<A>(value: A, state: PredState): boolean {
  if (state.predicate(value)) {
    state.result = value;
    return false;
  } else {
    return true;
  }
}

export function find<A>(
  predicate: (a: A) => boolean,
  l: List<A>
): A | undefined {
  return foldlCb<A, PredState>(findCb, { predicate, result: undefined }, l)
    .result;
}

type IndexOfState = {
  element: any;
  found: boolean;
  index: number;
};

function indexOfCb<A>(value: A, state: IndexOfState): boolean {
  ++state.index;
  return !(state.found = elementEquals(value, state.element));
}

export function indexOf<A>(element: A, l: List<A>): number {
  const { found, index } = foldlCb<A, IndexOfState>(
    indexOfCb,
    { element, found: false, index: -1 },
    l
  );
  return found ? index : -1;
}

type FindIndexState = {
  predicate: (a: any) => boolean;
  found: boolean;
  index: number;
};

function findIndexCb<A>(value: A, state: FindIndexState): boolean {
  ++state.index;
  return !(state.found = state.predicate(value));
}

export function findIndex<A>(predicate: (a: A) => boolean, l: List<A>): number {
  const { found, index } = foldlCb<A, FindIndexState>(
    findIndexCb,
    { predicate, found: false, index: -1 },
    l
  );
  return found ? index : -1;
}

type ContainsState = {
  element: any;
  result: boolean;
};

const containsState: ContainsState = {
  element: undefined,
  result: false
};

function containsCb(value: any, state: ContainsState): boolean {
  return !(state.result = value === state.element);
}

export function includes<A>(element: A, l: List<A>): boolean {
  containsState.element = element;
  containsState.result = false;
  return foldlCb(containsCb, containsState, l).result;
}

export const contains = includes;

type EqualsState = {
  iterator: Iterator<any>;
  equals: boolean;
};

const equalsState: EqualsState = {
  iterator: undefined as any,
  equals: true
};

function equalsCb(value2: any, state: EqualsState): boolean {
  const { value } = state.iterator.next();
  return (state.equals = elementEquals(value, value2));
}

export function equals<A>(firstList: List<A>, secondList: List<A>): boolean {
  if (firstList === secondList) {
    return true;
  } else if (firstList.length !== secondList.length) {
    return false;
  } else {
    equalsState.iterator = secondList[Symbol.iterator]();
    equalsState.equals = true;
    return foldlCb<A, EqualsState>(equalsCb, equalsState, firstList).equals;
  }
}

// concat

const eMax = 2;

function createConcatPlan(array: Node[]): number[] | undefined {
  const sizes = [];
  let sum = 0;
  for (let i = 0; i < array.length; ++i) {
    sum += array[i].array.length; // FIXME: maybe only access array once
    sizes[i] = array[i].array.length;
  }
  const optimalLength = Math.ceil(sum / branchingFactor);
  let n = array.length;
  let i = 0;
  if (optimalLength + eMax >= n) {
    return undefined; // no rebalancing needed
  }
  while (optimalLength + eMax < n) {
    while (sizes[i] > branchingFactor - eMax / 2) {
      // Skip nodes that are already sufficiently balanced
      ++i;
    }
    // the node at this index is too short
    let remaining = sizes[i]; // number of elements to re-distribute
    do {
      const size = Math.min(remaining + sizes[i + 1], branchingFactor);
      sizes[i] = size;
      remaining = remaining - (size - sizes[i + 1]);
      ++i;
    } while (remaining > 0);
    // Shift nodes after
    for (let j = i; j <= n - 1; ++j) {
      sizes[j] = sizes[j + 1];
    }
    --i;
    --n;
  }
  sizes.length = n;
  return sizes;
}

/**
 * Combines the children of three nodes into an array. The last child
 * of `left` and the first child of `right is ignored as they've been
 * concatenated into `center`.
 */
function concatNodeMerge(
  left: Node | undefined,
  center: Node,
  right: Node | undefined
): Node[] {
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

function executeConcatPlan(
  merged: Node[],
  plan: number[],
  height: number
): any[] {
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
        // Set sizes on children unless they are leaf nodes
        setSizes(node, height - 1);
      }
      result.push(node);
    }
  }
  return result;
}

/**
 * Takes three nodes and returns a new node with the content of the
 * three nodes. Note: The returned node does not have its size table
 * set correctly. The caller must do that.
 */
function rebalance(
  left: Node | undefined,
  center: Node,
  right: Node | undefined,
  height: number,
  top: boolean
): Node {
  const merged = concatNodeMerge(left, center, right);
  const plan = createConcatPlan(merged);
  const balanced =
    plan !== undefined ? executeConcatPlan(merged, plan, height) : merged;
  if (balanced.length <= branchingFactor) {
    if (top === true) {
      return new Node(undefined, balanced);
    } else {
      // Return a single node with extra height for balancing at next
      // level
      return new Node(undefined, [
        setSizes(new Node(undefined, balanced), height)
      ]);
    }
  } else {
    return new Node(undefined, [
      setSizes(new Node(undefined, balanced.slice(0, branchingFactor)), height),
      setSizes(new Node(undefined, balanced.slice(branchingFactor)), height)
    ]);
  }
}

function concatSubTree<A>(
  left: Node,
  lDepth: number,
  right: Node,
  rDepth: number,
  isTop: boolean
): Node {
  if (lDepth > rDepth) {
    const c = concatSubTree(
      arrayLast(left.array),
      lDepth - 1,
      right,
      rDepth,
      false
    );
    return rebalance(left, c, undefined, lDepth, isTop);
  } else if (lDepth < rDepth) {
    const c = concatSubTree(
      left,
      lDepth,
      arrayFirst(right.array),
      rDepth - 1,
      false
    );
    return rebalance(undefined, c, right, rDepth, isTop);
  } else if (lDepth === 0) {
    return new Node(undefined, [left, right]);
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

/**
 * Takes a RRB-tree and a node tail. It then appends the node to the
 * tree.
 * @param l The subject for appending. `l` will be mutated. Nodes in
 * the tree will _not_ be mutated.
 * @param node The node that should be appended to the tree.
 */
function appendNodeToTree<A>(l: List<A>, node: Node): List<A> {
  if (l.root === undefined) {
    // The old list has no content in tree, all content is in affixes
    if (getPrefixSize(l) === 0) {
      l.bits = setPrefix(node.array.length, l.bits);
      l.prefix = reverseArray(node.array);
    } else {
      l.root = node;
    }
    return l;
  }
  const depth = getDepth(l);
  let index = l.length - 1 - getPrefixSize(l);
  let nodesToCopy = 0;
  let nodesVisited = 0;
  let shift = depth * 5;
  let currentNode = l.root;
  if (32 ** (depth + 1) < index) {
    shift = 0; // there is no room
    nodesVisited = depth;
  }
  while (shift > 5) {
    let childIndex: number;
    if (currentNode.sizes === undefined) {
      // does not have size table
      childIndex = (index >> shift) & mask;
      index &= ~(mask << shift); // wipe just used bits
    } else {
      childIndex = currentNode.array.length - 1;
      index -= currentNode.sizes[childIndex - 1];
    }
    nodesVisited++;
    if (childIndex < mask) {
      // we are not going down the far right path, this implies that
      // there is still room in the current node
      nodesToCopy = nodesVisited;
    }
    currentNode = currentNode.array[childIndex];
    if (currentNode === undefined) {
      // This will only happened in a pvec subtree. The index does not
      // exist so we'll have to create a new path from here on.
      nodesToCopy = nodesVisited;
      shift = 5; // Set shift to break out of the while-loop
    }
    shift -= 5;
  }

  if (shift !== 0) {
    nodesVisited++;
    if (currentNode.array.length < branchingFactor) {
      // there is room in the found node
      nodesToCopy = nodesVisited;
    }
  }

  if (nodesToCopy === 0) {
    // there was no room in the found node
    const newPath = nodesVisited === 0 ? node : createPath(nodesVisited, node);
    const newRoot = new Node(undefined, [l.root, newPath]);
    l.root = newRoot;
    l.bits = incrementDepth(l.bits);
  } else {
    const copiedNode = copyFirstK(l, l, nodesToCopy, node.array.length);
    const leaf = appendEmpty(copiedNode, depth - nodesToCopy);
    leaf.array.push(node);
  }
  return l;
}

/**
 * Traverses down the right edge of the tree and copies k nodes
 * @param oldList
 * @param newList
 * @param k The number of nodes to copy. Will always be at least 1.
 * @param leafSize The number of elements in the leaf that will be inserted.
 */
function copyFirstK(
  oldList: List<any>,
  newList: List<any>,
  k: number,
  leafSize: number
): Node {
  let currentNode = cloneNode(oldList.root!); // copy root
  newList.root = currentNode; // install root

  for (let i = 1; i < k; ++i) {
    const index = currentNode.array.length - 1;
    if (currentNode.sizes !== undefined) {
      currentNode.sizes[index] += leafSize;
    }
    const newNode = cloneNode(currentNode.array[index]);
    // Install the copied node
    currentNode.array[index] = newNode;
    currentNode = newNode;
  }
  if (currentNode.sizes !== undefined) {
    currentNode.sizes.push(arrayLast(currentNode.sizes) + leafSize);
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

/*
function concatSuffix<A>(
  left: A[], lSize: number, right: A[], rSize: number
): A[] {
  const newArray = new Array(lSize + rSize);
  for (let i = 0; i < lSize; ++i) {
    newArray[i] = left[i];
  }
  for (let i = 0; i < rSize; ++i) {
    newArray[lSize + i] = right[i];
  }
  return newArray;
}
*/

const concatBuffer = new Array(3);

function concatAffixes<A>(left: List<A>, right: List<A>): number {
  // TODO: Try and find a neat way to reduce the LOC here
  var nr = 0;
  var arrIdx = 0;
  var i = 0;
  var length = getSuffixSize(left);
  concatBuffer[nr] = [];
  for (i = 0; i < length; ++i) {
    concatBuffer[nr][arrIdx] = left.suffix[i];
    if (++arrIdx === 32) {
      arrIdx = 0;
      ++nr;
      concatBuffer[nr] = [];
    }
  }
  length = getPrefixSize(right);
  for (i = 0; i < length; ++i) {
    concatBuffer[nr][arrIdx] = right.prefix[right.prefix.length - 1 - i];
    if (++arrIdx === 32) {
      arrIdx = 0;
      ++nr;
      concatBuffer[nr] = [];
    }
  }
  length = getSuffixSize(right);
  for (i = 0; i < length; ++i) {
    concatBuffer[nr][arrIdx] = right.suffix[i];
    if (++arrIdx === 32) {
      arrIdx = 0;
      ++nr;
      concatBuffer[nr] = [];
    }
  }
  return nr;
}

export function concat<A>(left: List<A>, right: List<A>): List<A> {
  if (left.length === 0) {
    return right;
  } else if (right.length === 0) {
    return left;
  }
  const newSize = left.length + right.length;
  const rightSuffixSize = getSuffixSize(right);
  let newList = cloneList(left);
  if (right.root === undefined) {
    // right is nothing but a prefix and a suffix
    const nrOfAffixes = concatAffixes(left, right);
    for (var i = 0; i < nrOfAffixes; ++i) {
      newList = appendNodeToTree(newList, new Node(undefined, concatBuffer[i]));
      newList.length += concatBuffer[i].length;
      // wipe pointer, otherwise it might end up keeping the array alive
      concatBuffer[i] = undefined;
    }
    newList.length = newSize;
    newList.suffix = concatBuffer[nrOfAffixes];
    newList.bits = setSuffix(concatBuffer[nrOfAffixes].length, newList.bits);
    concatBuffer[nrOfAffixes] = undefined;
    return newList;
  } else {
    newList = appendNodeToTree(newList, suffixToNode(left.suffix));
    newList.length += getSuffixSize(left);
    newList = appendNodeToTree(newList, prefixToNode(right.prefix));
    const newNode = concatSubTree(
      newList.root!,
      getDepth(newList),
      right.root,
      getDepth(right),
      true
    );
    const newDepth = getHeight(newNode);
    setSizes(newNode, newDepth);
    const bits = createBits(newDepth, getPrefixSize(newList), rightSuffixSize);
    // FIXME: Return `newList` here
    return new List(bits, 0, newSize, newNode, right.suffix, newList.prefix);
  }
}

export function update<A>(index: number, a: A, l: List<A>): List<A> {
  const prefixSize = getPrefixSize(l);
  const suffixSize = getSuffixSize(l);
  const newList = cloneList(l);
  if (index < prefixSize) {
    const newPrefix = copyArray(newList.prefix);
    newPrefix[newPrefix.length - index - 1] = a;
    newList.prefix = newPrefix;
  } else if (index >= l.length - suffixSize) {
    const newSuffix = copyArray(newList.suffix);
    newSuffix[index - (l.length - suffixSize)] = a;
    newList.suffix = newSuffix;
  } else {
    newList.root = updateNode(
      l.root!,
      getDepth(l),
      index - prefixSize + l.offset,
      l.offset,
      a
    );
  }
  return newList;
}

export function adjust<A>(f: (a: A) => A, index: number, l: List<A>): List<A> {
  return update(index, f(nth(index, l)), l);
}

// slice and slice based functions

let newAffix: any[];

// function getBitsForDepth(n: number, depth: number): number {
//   return n & ~(~0 << (depth * branchBits));
// }

function sliceNode(
  node: Node,
  // index: number,
  depth: number,
  pathLeft: number,
  pathRight: number,
  childLeft: Node | undefined,
  childRight: Node | undefined
): Node {
  let array = node.array.slice(pathLeft, pathRight + 1);
  if (childLeft !== undefined) {
    array[0] = childLeft;
  }
  if (childRight !== undefined) {
    array[array.length - 1] = childRight;
  }
  let sizes = node.sizes;
  if (sizes !== undefined) {
    sizes = sizes.slice(pathLeft, pathRight + 1);
    let slicedOff: number;
    if (childLeft === undefined) {
      slicedOff = node.sizes![pathLeft - 1];
    } else {
      slicedOff =
        sizeOfSubtree(node.array[pathLeft], depth - 1) -
        sizeOfSubtree(childLeft, depth - 1);
      // slicedOff = (getBitsForDepth(index, depth) | mask) + 1;
    }
    for (let i = 0; i < sizes.length; ++i) {
      sizes[i] -= slicedOff;
    }
  }
  return new Node(sizes, array);
}

function sliceLeft(
  tree: Node,
  depth: number,
  index: number,
  offset: number
): Node | undefined {
  const curOffset = (offset >> (depth * branchBits)) & mask;
  let path = ((index >> (depth * branchBits)) & mask) - curOffset;
  if (depth === 0) {
    newAffix = tree.array.slice(path).reverse();
    // This leaf node is moved up as a suffix so there is nothing here
    // after slicing
    return undefined;
  } else {
    // Slice the child
    const child = sliceLeft(
      tree.array[path],
      depth - 1,
      index,
      path === 0 ? offset : 0
    );
    if (child === undefined) {
      // There is nothing in the child after slicing so we don't include it
      ++path;
      if (path === tree.array.length) {
        return undefined;
      }
    }
    return sliceNode(
      tree,
      // index,
      depth,
      path,
      tree.array.length - 1,
      child,
      undefined
    );
  }
}

function sliceRight(
  tree: Node,
  depth: number,
  index: number,
  offset: number
): Node | undefined {
  const curOffset = (offset >> (depth * branchBits)) & mask;
  let path = ((index >> (depth * branchBits)) & mask) - curOffset;
  if (depth === 0) {
    newAffix = tree.array.slice(0, path + 1);
    // this leaf node is moved up as a suffix so there is nothing here
    // after slicing
    return undefined;
  } else {
    // slice the child, note that we subtract 1 then the radix lookup
    // algorithm can find the last element that we want to include
    // and sliceRight will do a slice that is inclusive on the index.
    const child = sliceRight(
      tree.array[path],
      depth - 1,
      index,
      path === 0 ? offset : 0
    );
    if (child === undefined) {
      // there is nothing in the child after slicing so we don't include it
      --path;
      if (path === -1) {
        return undefined;
      }
    }
    // note that we add 1 to the path since we want the slice to be
    // inclusive on the end index. Only at the leaf level do we want
    // to do an exclusive slice.
    let array = tree.array.slice(0, path + 1);
    if (child !== undefined) {
      array[array.length - 1] = child;
    }
    return new Node(tree.sizes, array); // FIXME: handle the size table
  }
}

function sliceTreeList<A>(
  from: number,
  to: number,
  tree: Node,
  depth: number,
  offset: number,
  l: List<A>
): List<A> {
  const curOffset = (offset >> (depth * branchBits)) & mask;
  let pathLeft = ((from >> (depth * branchBits)) & mask) - curOffset;
  let pathRight = ((to >> (depth * branchBits)) & mask) - curOffset;
  if (depth === 0) {
    // we are slicing a piece off a leaf node
    l.prefix = emptyAffix;
    l.suffix = tree.array.slice(pathLeft, pathRight + 1);
    l.root = undefined;
    l.bits = setSuffix(pathRight - pathLeft + 1, 0);
    return l;
  } else if (pathLeft === pathRight) {
    // Both ends are located in the same subtree, this means that we
    // can reduce the height
    l.bits = decrementDepth(l.bits);
    return sliceTreeList(
      from,
      to,
      tree.array[pathLeft],
      depth - 1,
      pathLeft === 0 ? offset : 0,
      l
    );
  } else {
    const childLeft = sliceLeft(
      tree.array[pathLeft],
      depth - 1,
      from,
      pathLeft === 0 ? offset : 0
    );
    l.bits = setPrefix(newAffix.length, l.bits);
    l.prefix = newAffix;

    const childRight = sliceRight(tree.array[pathRight], depth - 1, to, 0);
    l.bits = setSuffix(newAffix.length, l.bits);
    l.suffix = newAffix;
    if (childLeft === undefined) {
      ++pathLeft;
    }
    if (childRight === undefined) {
      --pathRight;
    }
    if (pathLeft >= pathRight) {
      if (pathLeft > pathRight) {
        // This only happens when `pathLeft` originally was equal to
        // `pathRight + 1` and `childLeft === childRight === undefined`.
        // In this case there is no tree left.
        l.bits = setDepth(0, l.bits);
        l.root = undefined;
      } else {
        // Height can be reduced
        l.bits = decrementDepth(l.bits);
        const newRoot =
          childRight !== undefined
            ? childRight
            : childLeft !== undefined ? childLeft : tree.array[pathLeft];
        l.root = new Node(newRoot.sizes, newRoot.array); // Is this size handling good enough?
      }
    } else {
      l.root = sliceNode(
        tree,
        // from,
        depth,
        pathLeft,
        pathRight,
        childLeft,
        childRight
      );
    }
    return l;
  }
}

export function slice<A>(from: number, to: number, l: List<A>): List<A> {
  let { bits, length } = l;

  to = Math.min(length, to);
  // Handle negative indices
  if (from < 0) {
    from = length + from;
  }
  if (to < 0) {
    to = length + to;
  }

  // Should we just return the empty list?
  if (to <= from || to <= 0 || length <= from) {
    return empty();
  }

  // Return list unchanged if we are slicing nothing off
  if (from <= 0 && length <= to) {
    return l;
  }

  const newLength = to - from;
  let prefixSize = getPrefixSize(l);
  const suffixSize = getSuffixSize(l);

  // Both indices lie in the prefix
  if (to <= prefixSize) {
    return new List(
      setPrefix(newLength, 0),
      0,
      newLength,
      undefined,
      emptyAffix,
      l.prefix.slice(l.prefix.length - to, l.prefix.length - from)
    );
  }

  const suffixStart = length - suffixSize;
  // Both indices lie in the suffix
  if (suffixStart <= from) {
    return new List(
      setSuffix(newLength, 0),
      0,
      newLength,
      undefined,
      l.suffix.slice(from - suffixStart, to - suffixStart),
      emptyAffix
    );
  }

  const newList = cloneList(l);

  // Both indices lie in the tree
  if (prefixSize <= from && to <= suffixStart) {
    sliceTreeList(
      from - prefixSize + l.offset,
      to - prefixSize + l.offset - 1,
      l.root!,
      getDepth(l),
      l.offset,
      newList
    );
    if (newList.root !== undefined) {
      // The height of the tree might have been reduced. The offset
      // will be for a deeper tree. By clearing some of the left-most
      // bits we can make the offset fit the new height of the tree.
      const bits = ~(~0 << (getDepth(newList) * branchBits));
      newList.offset =
        (newList.offset + from - prefixSize + getPrefixSize(newList)) & bits;
    }
    newList.length = to - from;
    return newList;
  }

  // we need to slice something off of the left
  if (0 < from) {
    if (from < prefixSize) {
      // do a cheap slice by setting prefix length
      bits = setPrefix(prefixSize - from, bits);
    } else {
      // if we're here `to` can't lie in the tree, so we can set the
      // root
      newList.root = sliceLeft(
        newList.root!,
        getDepth(l),
        from - prefixSize + l.offset,
        l.offset
      );
      bits = setPrefix(newAffix.length, bits);
      newList.offset += from - prefixSize + newAffix.length;
      prefixSize = newAffix.length;
      newList.prefix = newAffix;
    }
    newList.length -= from;
  }

  if (to < length) {
    if (length - to < suffixSize) {
      bits = setSuffix(suffixSize - (length - to), bits);
    } else {
      newList.root = sliceRight(
        newList.root!,
        getDepth(l),
        to - prefixSize + newList.offset - 1,
        newList.offset
      );
      if (newList.root === undefined) {
        bits = setDepth(0, bits);
      }
      bits = setSuffix(newAffix.length, bits);
      newList.suffix = newAffix;
    }
    newList.length -= length - to;
  }
  newList.bits = bits;
  return newList;
}

export function take<A>(n: number, l: List<A>): List<A> {
  return slice(0, n, l);
}

type FindNotIndexState = {
  predicate: (a: any) => boolean;
  index: number;
};

function findNotIndexCb<A>(value: A, state: FindNotIndexState): boolean {
  ++state.index;
  return state.predicate(value);
}

export function takeWhile<A>(
  predicate: (a: A) => boolean,
  l: List<A>
): List<A> {
  const { index } = foldlCb<A, FindNotIndexState>(
    findNotIndexCb,
    { predicate, index: -1 },
    l
  );
  return slice(0, index, l);
}

export function dropWhile<A>(
  predicate: (a: A) => boolean,
  l: List<A>
): List<A> {
  const { index } = foldlCb<A, FindNotIndexState>(
    findNotIndexCb,
    { predicate, index: -1 },
    l
  );
  return slice(index, l.length, l);
}

export function takeLast<A>(n: number, l: List<A>): List<A> {
  return slice(l.length - n, l.length, l);
}

export function splitAt<A>(index: number, l: List<A>): [List<A>, List<A>] {
  return [slice(0, index, l), slice(index, l.length, l)];
}

export function remove<A>(from: number, amount: number, l: List<A>): List<A> {
  return concat(slice(0, from, l), slice(from + amount, l.length, l));
}

export function drop<A>(n: number, l: List<A>): List<A> {
  return slice(n, l.length, l);
}

export function dropLast<A>(n: number, l: List<A>): List<A> {
  return slice(0, l.length - n, l);
}

export function pop<A>(l: List<A>): List<A> {
  return slice(0, -1, l);
}

export const init = pop;

export function tail<A>(l: List<A>): List<A> {
  return slice(1, l.length, l);
}

function arrayPush<A>(array: A[], a: A): A[] {
  array.push(a);
  return array;
}

export function toArray<A>(l: List<A>): A[] {
  return foldl<A, A[]>(arrayPush, [], l);
}

export function fromArray<A>(array: A[]): List<A> {
  let l = empty();
  for (let i = 0; i < array.length; ++i) {
    l = append(array[i], l);
  }
  return l;
}

export function fromIterable<A>(iterable: IterableIterator<A>): List<A> {
  let l = empty();
  let iterator = iterable[Symbol.iterator]();
  let cur;
  // tslint:disable-next-line:no-conditional-assignment
  while ((cur = iterator.next()).done === false) {
    l = append(cur.value, l);
  }
  return l;
}

export function insert<A>(index: number, element: A, l: List<A>): List<A> {
  return concat(append(element, slice(0, index, l)), slice(index, l.length, l));
}

export function insertAll<A>(
  index: number,
  elements: List<A>,
  l: List<A>
): List<A> {
  return concat(
    concat(slice(0, index, l), elements),
    slice(index, l.length, l)
  );
}

export function reverse<A>(l: List<A>): List<A> {
  return foldl((newL, element) => prepend(element, newL), empty(), l);
}
