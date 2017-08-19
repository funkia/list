const branchingFactor = 32;
const branchBits = 5;
const mask = 31;

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

function arrayPrepend<A>(value: A, array: A[]): A[] {
  const newLength = array.length + 1;
  const result = new Array(newLength);
  result[0] = value;
  for (let i = 1; i < newLength; ++i) {
    result[i] = array[i - 1];
  }
  return result;
}

function arrayAppend<A>(value: A, array: A[]): A[] {
  const { length } = array;
  const result = new Array(length + 1);
  for (let i = 0; i < length; ++i) {
    result[i] = array[i];
  }
  result[length] = value;
  return result;
}

function reverseArray<A>(array: A[]): A[] {
  return array.slice().reverse();
}

function arrayFirst<A>(array: A[]): A {
  return array[0];
}

function arrayLast<A>(array: A[]): A {
  return array[array.length - 1];
}

export class Node {
  constructor(public sizes: number[], public array: any[]) {
  }
  update(depth: number, index: number, offset: number, value: any): Node {
    const curOffset = (offset >> (depth * branchBits)) & mask;
    const path = ((index >> (depth * branchBits)) & mask) - curOffset;
    let array;
    if (path < 0) {
      array = arrayPrepend(createPath(depth, value), this.array);
    } else if (this.array.length <= path) {
      array = arrayAppend(createPath(depth, value), this.array);
    } else {
      array = copyArray(this.array);
      if (depth === 0) {
        array[path] = value;
      } else {
        array[path] = array[path].update(depth - 1, index, path === 0 ? offset : 0, value);
      }
    }
    return new Node(this.sizes, array);
  }
}

function nodeNthDense(
  node: Node, depth: number, index: number, offset: number
): any {
  index += offset;
  let path;
  let current = node;
  for (; depth >= 0; --depth) {
    path =
      ((index >> (depth * branchBits)) & mask) - ((offset >> (depth * branchBits)) & mask);
    if (path !== 0) {
      offset = 0;
    }
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
  return nodeNthDense(current, depth, index, 0);
}

function cloneNode(node: Node): Node {
  return new Node(node.sizes, copyArray(node.array));
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

const emptyAffix: any[] = [undefined];

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

const affixMask = 0b111111;
const affixBits = 6;

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
  return (depth << (affixBits * 2)) | (bits & (affixMask & (affixMask << affixBits)));
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

function createBits(depth: number, prefixSize: number, suffixSize: number): number {
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
    public root: Node,
    public suffix: A[],
    public prefix: A[]
  ) { }
  space(): number {
    return (branchingFactor ** (getDepth(this) + 1))
      - (this.length - getSuffixSize(this) - getPrefixSize(this) + this.offset);
  }
  [Symbol.iterator](): Iterator<A> {
    return new ListIterator(this);
  }
  "fantasy-land/map"<B>(f: (a: A) => B): List<B> {
    return map(f, this);
  }
  "fantasy-land/empty"(): List<any> {
    return empty();
  }
  "fantasy-land/concat"(right: List<A>): List<A> {
    return concat(this, right);
  }
  "fantasy-land/reduce"<B>(f: (acc: B, value: A) => B, initial: B): B {
    return foldl(f, initial, this);
  }
  append(value: A): List<A> {
    return append(value, this);
  }
  nth(index: number): A | undefined {
    return nth(index, this);
  }
}

function cloneList<A>(l: List<A>): List<A> {
  return new List(l.bits, l.offset, l.length, l.root, l.suffix, l.prefix);
}

const iteratorDone: IteratorResult<any> = { done: true, value: undefined };

class ListIterator<A> implements Iterator<A> {
  stack: any[][];
  indices: number[];
  prefixLeft: number;
  constructor(private list: List<A>) {
    this.stack = [];
    this.indices = [];
    this.prefixLeft = getPrefixSize(list);
    if (list.root !== undefined) {
      let currentNode = list.root.array;
      const depth = getDepth(list);
      for (let i = 0; i < depth + 1; ++i) {
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
    const depth = getDepth(this.list);
    for (let i = this.indices.length - 1; i < depth; ++i) {
      this.stack.push(arrayLast(this.stack)[arrayLast(this.indices)].array);
      this.indices.push(0);
    }
  }
  next(): IteratorResult<A> {
    if (this.prefixLeft > 0) {
      --this.prefixLeft;
      return { done: false, value: this.list.prefix[this.prefixLeft] };
    } else if (this.stack.length !== 0) {
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
    const suffixSize = getSuffixSize(this.list);
    if (this.indices[0] < suffixSize - 1) {
      const idx = this.incrementIndex();
      return { done: false, value: this.list.suffix[idx] };
    }
    return iteratorDone;
  }
}

// prepend & append

export function prepend<A>(value: A, l: List<A>): List<A> {
  const prefixSize = getPrefixSize(l);
  const depth = getDepth(l);
  if (prefixSize < 32) {
    return new List<A>(
      incrementPrefix(l.bits),
      l.offset,
      l.length + 1,
      l.root,
      l.suffix,
      affixPush(value, l.prefix, prefixSize)
    );
  }
  const newPrefix = [value];
  let bits = setPrefix(1, l.bits);
  if (l.root === undefined) {
    if (getSuffixSize(l) === 0) {
      // ensure invariant 1
      return new List(
        setSuffix(32, bits), l.offset, l.length + 1, undefined, reverseArray(l.prefix), newPrefix
      );
    }
    return new List(
      bits, 0, l.length + 1, prefixToNode(l.prefix), l.suffix, newPrefix
    );
  }
  const prefixNode = prefixToNode(l.prefix);
  let full = l.offset === 0;
  let root;
  let newOffset = 0;
  if (full === true) {
    if (l.root.array.length < branchingFactor) {
      // there is space in the root
      newOffset = 32 ** (depth + 0) - 32;
      full = false;
      root = new Node(
        undefined,
        arrayPrepend(createPath(depth - 1, prefixNode), l.root.array)
      );
    } else {
      // we need to create a new root
      newOffset = depth === 0 ? 0 : (32 ** (depth + 1)) - 32;
      root = new Node(undefined, [createPath(depth, prefixNode), l.root]);
    }
  } else {
    newOffset = l.offset - branchingFactor;
    root = l.root.update(depth - 1, (l.offset - 1) >> 5, l.offset >> 5, prefixNode);
  }
  if (full === true) {
    bits = incrementDepth(bits);
  }
  return new List(bits, newOffset, l.length + 1, root, l.suffix, newPrefix);
}

export function append<A>(value: A, l: List<A>): List<A> {
  const suffixSize = getSuffixSize(l);
  const depth = getDepth(l);
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
  let bits = setSuffix(1, l.bits);
  if (l.root === undefined) {
    if (getPrefixSize(l) === 0) {
      // ensure invariant 1
      return new List(
        setPrefix(32, bits), l.offset, l.length + 1, undefined, newSuffix, reverseArray(l.suffix)
      );
    }
    return new List(
      bits, l.offset, l.length + 1, suffixNode, newSuffix, l.prefix
    );
  }
  const full = l.space() <= 0;
  let node;
  if (full === true) {
    node = new Node(undefined, [l.root, createPath(depth, suffixNode)]);
  } else {
    const rootContent = l.length - suffixSize - getPrefixSize(l);
    node = l.root.update(depth - 1, (l.offset + rootContent) >> 5, l.offset >> 5, suffixNode);
  }
  if (full === true) {
    bits = incrementDepth(bits);
  }
  return new List(
    bits, l.offset, l.length + 1, node, newSuffix, l.prefix
  );
}

export function list<A>(...elements: A[]): List<A> {
  let l = empty();
  for (const element of elements) {
    l = append(element, l);
  }
  return l;
}

export function pair<A>(first: A, second: A): List<A> {
  return new List(
    2, 0, 2, undefined, [first, second], emptyAffix
  );
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

export function last(l: List<any>): number {
  if (getSuffixSize(l) !== 0) {
    return arrayLast(l.suffix);
  } else if (getPrefixSize(l) !== 0) {
    return arrayFirst(l.prefix);
  }
}

export function nth<A>(index: number, l: List<A>): A | undefined {
  const prefixSize = getPrefixSize(l);
  const suffixSize = getSuffixSize(l);
  const { offset } = l;
  if (index < prefixSize) {
    return l.prefix[prefixSize - index - 1];
  } else if (index >= l.length - suffixSize) {
    return l.suffix[index - (l.length - suffixSize)];
  }
  const depth = getDepth(l);
  return l.root.sizes === undefined
    ? nodeNthDense(l.root, depth, index - prefixSize, offset)
    : nodeNth(l.root, depth, index - prefixSize);
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

function mapAffix<A, B>(
  f: (a: A) => B, suffix: A[], length: number
): B[] {
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

export function range(start: number, end: number): List<number> {
  let list = empty();
  for (let i = start; i < end; ++i) {
    list = list.append(i);
  }
  return list;
}

// fold

function foldlSuffix<A, B>(
  f: (acc: B, value: A) => B, acc: B, array: A[], length: number
): B {
  for (let i = 0; i < length; ++i) {
    acc = f(acc, array[i]);
  }
  return acc;
}

function foldlPrefix<A, B>(
  f: (acc: B, value: A) => B, acc: B, array: A[], length: number
): B {
  for (let i = length - 1; 0 <= i; --i) {
    acc = f(acc, array[i]);
  }
  return acc;
}

function foldlNode<A, B>(
  f: (acc: B, value: A) => B, acc: B, node: Node, depth: number
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

export function foldl<A, B>(f: (acc: B, value: A) => B, initial: B, l: List<A>): B {
  const suffixSize = getSuffixSize(l);
  const prefixSize = getPrefixSize(l);
  initial = foldlPrefix(f, initial, l.prefix, prefixSize);
  if (l.root !== undefined) {
    initial = foldlNode(f, initial, l.root, getDepth(l));
  }
  return foldlSuffix(f, initial, l.suffix, suffixSize);
}

export const reduce = foldl;

function foldrSuffix<A, B>(
  f: (value: A, acc: B) => B, initial: B, array: A[], length: number
): B {
  let acc = initial;
  for (let i = length - 1; 0 <= i; --i) {
    acc = f(array[i], acc);
  }
  return acc;
}

function foldrPrefix<A, B>(
  f: (value: A, acc: B) => B, initial: B, array: A[], length: number
): B {
  let acc = initial;
  for (let i = 0; i < length; ++i) {
    acc = f(array[i], acc);
  }
  return acc;
}

function foldrNode<A, B>(
  f: (value: A, acc: B) => B, initial: B, { array }: Node, depth: number
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

export function foldr<A, B>(f: (value: A, acc: B) => B, initial: B, l: List<A>): B {
  const suffixSize = getSuffixSize(l);
  const prefixSize = getPrefixSize(l);
  let acc = foldrSuffix(f, initial, l.suffix, suffixSize);
  if (l.root !== undefined) {
    acc = foldrNode(f, acc, l.root, getDepth(l));
  }
  return foldrPrefix(f, acc, l.prefix, prefixSize);
}

export const reduceRight = foldr;

// callback fold

type FoldCb<Input, State> = (input: Input, state: State) => boolean;

function foldlSuffixCb<A, B>(
  cb: FoldCb<A, B>, state: B, array: A[], length: number
): boolean {
  for (var i = 0; i < length && cb(array[i], state); ++i) { }
  return i === length;
}

function foldlPrefixCb<A, B>(
  cb: FoldCb<A, B>, state: B, array: A[], length: number
): boolean {
  for (var i = length - 1; 0 <= i && cb(array[i], state); ++i) { }
  return i === 0 || length === 0;
}

function foldlNodeCb<A, B>(
  cb: FoldCb<A, B>, state: B, node: Node, depth: number
): boolean {
  const { array } = node;
  if (depth === 0) {
    return foldlSuffixCb(cb, state, array, array.length);
  }
  for (
    var i = 0;
    i < array.length && foldlNodeCb(cb, state, array[i], depth - 1);
    ++i
  ) { }
  return i === array.length;
}

/**
 * This function is a lot like a fold. But the reducer function is
 * supposed to mutate its state instead of returning it. Instead of
 * returning a new state it returns a boolean that tells wether or not
 * to continue the fold. If it returns true then the folding should
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
  predicate: (a: any) => boolean,
  result: any
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

function findCb<A>(value: A, state: PredState) {
  if (state.predicate(value)) {
    state.result = value;
    return false;
  } else {
    return true;
  }
}

export function find<A>(predicate: (a: A) => boolean, l: List<A>): A | undefined {
  return foldlCb<A, PredState>(findCb, { predicate, result: undefined }, l).result;
}

type ContainsState = {
  element: any,
  result: boolean
};

const containsState: ContainsState = {
  element: undefined,
  result: false
};

function containsCb(value: any, state: ContainsState): boolean {
  return !(state.result = (value === state.element));
}

export function contains<A>(element: A, l: List<A>): boolean {
  containsState.element = element;
  containsState.result = false;
  return foldlCb(containsCb, containsState, l).result;
}

// concat

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
  newSuffix: A[],
  newSuffixSize: number
): List<A> {
  const depth = getDepth(newList);
  // install the new suffix in location
  newList.suffix = newSuffix;
  newList.bits = setSuffix(newSuffixSize, newList.bits);
  if (newList.root === undefined) {
    // The old tree has no content in tree, all content is in affixes
    newList.root = suffixNode;
    return newList;
  }
  let index = newList.length - 1 - getPrefixSize(newList);
  let nodesToCopy = 0;
  let nodesVisited = 0;
  let pos = 0;
  let shift = depth * 5;
  let currentNode = newList.root;
  if (32 ** (depth + 1) < index) {
    shift = 0; // there is no room
    nodesVisited = depth;
  }
  while (shift > 5) {
    let childIndex: number;
    if (true) {
      // does not have size table
      childIndex = (index >> shift) & mask;
      index &= ~(mask << shift); // wipe just used bits
    } else {
      // FIXME: handle size table
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
      : createPath(nodesVisited, suffixNode);
    const newRoot = new Node(undefined, [newList.root, newPath]);
    newList.root = newRoot;
    newList.bits = incrementDepth(newList.bits);
  } else {
    const node = copyFirstK(newList, newList, nodesToCopy);
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
    // FIXME: handle size table
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
    const nrOfAffixes = concatAffixes(left, right);
    // right is nothing but a prefix and a suffix
    for (var i = 0; i < nrOfAffixes; ++i) {
      newList = pushDownTail(
        left, newList, new Node(undefined, concatBuffer[i]), undefined, 0
      );
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
    newList = pushDownTail(left, newList, suffixToNode(left.suffix), undefined, 0);
    newList.length += getSuffixSize(left);
    newList = pushDownTail(left, newList, prefixToNode(right.prefix), undefined, 0);
    const newNode = concatSubTree(newList.root, getDepth(newList), right.root, getDepth(right), true);
    const newDepth = getHeight(newNode);
    setSizes(newNode, newDepth);
    const bits = createBits(newDepth, getPrefixSize(left), rightSuffixSize);
    return new List(bits, 0, newSize, newNode, right.suffix, left.prefix);
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
    newList.root = l.root.update(getDepth(l), index - prefixSize + l.offset, l.offset, a);
  }
  return newList;
}

export function adjust<A>(f: (a: A) => A, index: number, l: List<A>): List<A> {
  return update(index, f(nth(index, l)), l);
}

// slice and slice based functions

let newAffix: any[] = undefined;

function sliceLeft(tree: Node, depth: number, index: number, offset: number): Node {
  const curOffset = (offset >> (depth * branchBits)) & mask;
  let path = ((index >> (depth * branchBits)) & mask) - curOffset;
  if (depth === 0) {
    newAffix = tree.array.slice(path).reverse();
    // this leaf node is moved up as a suffix so there is nothing here
    // after slicing
    return undefined;
  } else {
    // slice the child
    const child = sliceLeft(tree.array[path], depth - 1, index, path === 0 ? offset : 0);
    if (child === undefined) {
      // there is nothing in the child after slicing so we don't include it
      ++path;
      if (path === tree.array.length) {
        return undefined;
      }
    }
    let array = tree.array.slice(path);
    if (child !== undefined) {
      array[0] = child;
    }
    return new Node(tree.sizes, array); // FIXME: handle the size table
  }
}

function sliceRight(tree: Node, depth: number, index: number, offset: number): Node {
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
    const child = sliceRight(tree.array[path], depth - 1, index, path === 0 ? offset : 0);
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
  from: number, to: number, tree: Node, depth: number, offset: number, l: List<A>
): List<A> {
  const curOffset = (offset >> (depth * branchBits)) & mask;
  let pathLeft = ((from >> (depth * branchBits)) & mask) - curOffset;
  let pathRight = ((to >> (depth * branchBits)) & mask) - curOffset;
  if (depth === 0) {
    // we are slicing a piece of a leaf node
    l.prefix = undefined;
    l.suffix = tree.array.slice(pathLeft, pathRight + 1);
    l.root = undefined;
    l.bits = setSuffix(pathRight - pathLeft + 1, 0);
    return l;
  } else if (pathLeft === pathRight) {
    // Both ends are located in the same subtree, this means that we
    // can reduce the height
    // l.bits = decrementDepth(l.bits);
    // return sliceTreeList(from, to, tree.array[pathLeft], depth - 1, pathLeft === 0 ? offset : 0, l);
    const rec = sliceTreeList(from, to, tree.array[pathLeft], depth - 1, pathLeft === 0 ? offset : 0, l);
    if (rec.root !== undefined) {
      rec.root = new Node(undefined, [rec.root]);
    }
    return rec;
  } else {
    const childLeft = sliceLeft(tree.array[pathLeft], depth - 1, from, pathLeft === 0 ? offset : 0);
    l.bits = setPrefix(newAffix.length, l.bits);
    l.prefix = newAffix;
    const childRight = sliceRight(tree.array[pathRight], depth - 1, to, /* pathRight === 0 ? offset : */ 0);
    l.bits = setSuffix(newAffix.length, l.bits);
    l.suffix = newAffix;
    if (childLeft === undefined) {
      ++pathLeft;
    }
    if (childRight === undefined) {
      --pathRight;
    }
    if (childLeft > childRight) {
      // there is no tree left
      // l.bits = decrementDepth(l.bits);
      l.bits = setDepth(0, l.bits);
      l.root = undefined;
      // } else if (pathLeft === pathRight) {
      // height can be reduced
      // l.bits = decrementDepth(l.bits);
      // l.root = childLeft === undefined ? childRight : childLeft;
    } else {
      let array = tree.array.slice(pathLeft, pathRight + 1);
      if (childLeft !== undefined) {
        array[0] = childLeft;
      }
      if (childRight !== undefined) {
        array[array.length - 1] = childRight;
      }
      l.root = new Node(tree.sizes, array);
    }
    return l;
  }
}

export function slice<A>(from: number, to: number, l: List<A>): List<A> {
  let { bits, length } = l;

  // handle negative indices
  if (from < 0) {
    from = length + from;
  }
  if (to < 0) {
    to = length + to;
  }

  if (to <= from || to <= 0 || length <= from) {
    return empty();
  }

  // return list unchanged if we are slicing nothing off
  if (from <= 0 && length <= to) {
    return l;
  }

  const newLength = to - from;
  let prefixSize = getPrefixSize(l);
  const suffixSize = getSuffixSize(l);

  // both indices lie in the prefix
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
  // both indices lie in the suffix
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

  // both indices lie in the tree
  if (prefixSize <= from && to <= (length - suffixSize)) {
    sliceTreeList(
      from - prefixSize + l.offset,
      to - prefixSize + l.offset - 1,
      l.root,
      getDepth(l),
      l.offset,
      newList
    );
    newList.offset += from - prefixSize + getPrefixSize(newList);
    newList.length = to - from;
    return newList;
  }

  // we need to slice something off of the left
  if (0 <= from) {
    if (from < prefixSize) {
      // do a cheap slice by setting prefix length
      bits = setPrefix(prefixSize - from, bits);
    } else {
      // if we're here `to` can't lie in the tree, so we can set the
      // root
      newList.root = sliceLeft(
        newList.root, getDepth(l), from - prefixSize + l.offset, l.offset
      );
      bits = setPrefix(newAffix.length, bits);
      newList.offset += from - prefixSize + newAffix.length;
      prefixSize = newAffix.length;
      newList.prefix = newAffix;
    }
    newList.length -= from;
  }

  if (to < length) {
    if ((length - to) < suffixSize) {
      bits = setSuffix(suffixSize - (length - to), bits);
    } else {
      newList.root = sliceRight(
        newList.root, getDepth(l), to - prefixSize + newList.offset - 1, newList.offset
      );
      bits = setSuffix(newAffix.length, bits);
      newList.suffix = newAffix;
    }
    newList.length -= (length - to);
  }
  newList.bits = bits;
  return newList;
}

export function drop<A>(n: number, l: List<A>): List<A> {
  return l;
}

export function take<A>(n: number, l: List<A>): List<A> {
  const { length } = l;
  const prefixSize = getPrefixSize(l);
  const suffixSize = getSuffixSize(l);
  if (length <= n) {
    return l;
  } else if (n < prefixSize) {
    return new List(setPrefix(n, l.bits), 0, n, undefined, emptyAffix, l.prefix);
  } else if (n >= l.length - suffixSize) {
    return new List(setSuffix(n - (length - suffixSize), l.bits), 0, n, undefined, l.suffix, emptyAffix);
  } else {
    const newList = cloneList(l);
    newList.length = n;
    newList.root = sliceRight(l.root, getDepth(l), n, l.offset);
    newList.bits = setSuffix(newAffix.length, l.bits);
    newList.suffix = newAffix;
    return newList;
  }
}
