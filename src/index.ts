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
      array[path] = array[path].update(depth - 1, index, path === 0 ? offset : 0, value);
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
  return new Node(undefined, suffix);
}

function prefixToNode<A>(suffix: A[]): Node {
  return new Node(undefined, suffix.reverse());
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

const emptyAffix: any[] = [];

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
  constructor(private list: List<A>) {
    // this.nodeIdx = 0;
    this.stack = [];
    this.indices = [];
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

type TakeState<A> = {
  n: number,
  list: List<A>
};

function pushTake<A>(value: A, state: TakeState<A>): boolean {
  state.list = append(value, state.list);
  return (--state.n) !== 0;
}

export function take<A>(n: number, l: List<A>): List<A> {
  return l.length <= n
    ? l
    : foldlCb<A, TakeState<A>>(pushTake, { n, list: empty() }, l).list;
}

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
  const depth = getDepth(oldList);
  // install the new suffix in location
  newList.suffix = newSuffix;
  newList.bits = setSuffix(newSuffixSize, newList.bits);
  if (oldList.length <= branchingFactor) {
    // The old tree has no content in tree, all content is in affixes
    newList.root = suffixNode;
    return newList;
  }
  let index = oldList.length - 1;
  let nodesToCopy = 0;
  let nodesVisited = 0;
  let pos = 0;
  let shift = depth * 5;
  let currentNode = oldList.root;
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
      : createPath(nodesVisited, suffixNode);
    const newRoot = new Node(undefined, [newList.root, newPath]);
    newList.root = newRoot;
    newList.bits = incrementDepth(newList.bits);
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

export function concat<A>(left: List<A>, right: List<A>): List<A> {
  if (left.length === 0) {
    return right;
  } else if (right.length === 0) {
    return left;
  }
  const rightSuffixSize = getSuffixSize(right);
  if (right.root === undefined) {
    // right is nothing but a suffix
    const leftSuffixSize = getSuffixSize(left);
    if (rightSuffixSize + leftSuffixSize <= branchingFactor) {
      // the two suffixes can be combined into one
      return new List(
        setSuffix(leftSuffixSize + right.length, left.bits),
        0,
        left.length + right.length,
        left.root,
        concatSuffix(left.suffix, leftSuffixSize, right.suffix, rightSuffixSize),
        left.prefix
      );
    } else if (leftSuffixSize === branchingFactor) {
      // left suffix is full and can be pushed down
      const newList = cloneList(left);
      newList.length += right.length;
      return pushDownTail(left, newList, suffixToNode(newList.suffix), right.suffix, rightSuffixSize);
    } else {
      // we must merge the two suffixes and push down
      const newList = cloneList(left);
      newList.length += right.length;
      const newNode = new Node(undefined, []);
      const leftSize = leftSuffixSize;
      copyIndices(left.suffix, 0, newNode.array, 0, leftSuffixSize);
      const rightSize = branchingFactor - leftSize;
      copyIndices(right.suffix, 0, newNode.array, leftSize, rightSize);
      const newSuffixSize = rightSuffixSize - rightSize;
      const newSuffix = right.suffix.slice(rightSize);
      return pushDownTail(left, newList, newNode, newSuffix, newSuffixSize);
    }
  } else {
    const newSize = left.length + right.length;
    const newLeft = pushDownTail(left, cloneList(left), suffixToNode(left.suffix), undefined, 0);
    const newNode = concatSubTree(newLeft.root, getDepth(newLeft), right.root, getDepth(right), true);
    const newDepth = getHeight(newNode);
    setSizes(newNode, newDepth);
    const bits = createBits(newDepth, getPrefixSize(left), rightSuffixSize);
    return new List(bits, 0, newSize, newNode, right.suffix, left.prefix);
  }
}
