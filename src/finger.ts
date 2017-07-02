// An affix is a list that can only have length 0 to 4. It is a
// structure used internally in the finger tree.
export class Affix<A> {
  constructor(
    public size: number,
    public len: number,
    public a: A,
    public b?: A,
    public c?: A,
    public d?: A
  ) { }
  toArray(): A[] {
    switch (this.len) {
      case 0: return [];
      case 1: return [this.a];
      case 2: return [this.a, this.b];
      case 3: return [this.a, this.b, this.c];
      default: return [this.a, this.b, this.c, this.d];
    }
  }
  get(idx: number): A {
    switch (idx) {
      case 0: return this.a;
      case 1: return this.b;
      case 2: return this.c;
      default: return this.d;
    }
  }
}

function affixIntoArray<A>(affix: Affix<A>, offset: number, arr: A[]): void {
  switch (affix.len) {
    case 0: return;
    case 1: arr[offset] = affix.a; return;
    case 2: arr[offset] = affix.a, arr[offset + 1] = affix.b; return;
    case 3: arr[offset] = affix.a, arr[offset + 1] = affix.b, arr[offset + 2] = affix.c; return;
    default: arr[offset] = affix.a, arr[offset + 1] = affix.b, arr[offset + 2] = affix.c, arr[offset + 3] = affix.d; return;
  }
}

function affixIntoArrayRev<A>(affix: Affix<A>, offset: number, arr: A[]): void {
  switch (affix.len) {
    case 0: return;
    case 1: arr[offset] = affix.a; return;
    case 2: arr[offset] = affix.b, arr[offset + 1] = affix.a; return;
    case 3: arr[offset] = affix.c, arr[offset + 1] = affix.b, arr[offset + 2] = affix.a; return;
    default: arr[offset] = affix.d, arr[offset + 1] = affix.c, arr[offset + 2] = affix.b, arr[offset + 3] = affix.a; return;
  }
}

const emptyAffix: Affix<any> = new Affix(0, 0, undefined);

function affixPrepend<A>(size: number, a: A, as: Affix<A>): Affix<A> {
  return new Affix(as.size + size, as.len + 1, a, as.a, as.b, as.c);
}

// Node in a 2-3 tree
// export type NNode<A> = [A, A] | [A, A, A];
export class NNode<A> {
  constructor(
    public size: number, // number of elements in tree
    public three: boolean, // true if the node has three elements
    public a: A,
    public b: A,
    public c?: A
  ) { }
  get(idx: number): A {
    switch (idx) {
      case 0: return this.a;
      case 1: return this.b;
      default: return this.c;
    }
  }
}

export class FingerTree<A> {
  constructor(
    public depth: number,
    public size: number,
    public prefix: Affix<A>,
    public deeper: FingerTree<NNode<A>>,
    public suffix: Affix<A>
  ) { }
}

export const nil = new FingerTree<any>(
  0, 0, undefined, undefined, undefined
);

function deep<A>(
  depth: number, size: number, prefix: Affix<A>,
  deeper: FingerTree<NNode<A>>, suffix: Affix<A>
): FingerTree<A> {
  return new FingerTree(depth, size, prefix, deeper, suffix);
}

export function prepend<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  return nrPrepend(0, 1, a, t);
}

export function nrPrepend<A>(depth: number, size: number, a: A, t: FingerTree<A>): FingerTree<A> {
  if (t.size === 0) {
    return deep(depth, size, new Affix(size, 1, a), nil, emptyAffix);
  } else {
    return nrPrependDeep<A>(t.prefix, depth, t, size, a);
  }
}

function nrPrependDeep<A>(p: Affix<A>, depth: number, t: FingerTree<A>, s: number, a: A): FingerTree<A> {
  if (p.len < 4) {
    return deep(depth, t.size + s, affixPrepend(s, a, t.prefix), t.deeper, t.suffix);
  } else if (t.suffix === emptyAffix) {
    return deep(depth, t.size + s, new Affix(s, 1, a), t.deeper, new Affix(p.size, 4, p.d, p.c, p.b, p.a));
  } else {
    const num = depth === 0 ? 1 : (<any>p.a).size;
    const node = new NNode(p.size - num, true, p.b, p.c, p.d);
    return deep(
      depth, t.size + s, new Affix(s + num, 2, a, p.a), nrPrepend(depth + 1, node.size, node, t.deeper), t.suffix
    );
  }
}

export function append<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  return nrAppend(0, 1, a, t);
}

function nrAppend<A>(depth: number, size: number, a: A, t: FingerTree<A>): FingerTree<A> {
  if (t.size === 0) {
    return deep(depth, size, emptyAffix, nil, new Affix(size, 1, a));
  } else {
    return nrAppendDeep<A>(t.suffix, depth, t, size, a);
  }
}

function nrAppendDeep<A>(suf: Affix<A>, depth: number, t: FingerTree<A>, s: number, a: A): FingerTree<A> {
  if (suf.len < 4) {
    return deep(depth, t.size + s, t.prefix, t.deeper, affixPrepend(s, a, t.suffix));
  } else if (t.prefix === emptyAffix) {
    return deep(depth, t.size + s, new Affix(suf.size, 4, suf.d, suf.c, suf.b, suf.a), t.deeper, new Affix(s, 1, a));
  } else {
    const num = depth ? (<any>suf.a).size : 1;
    const node = new NNode(suf.size - num, true, suf.d, suf.c, suf.b);
    return deep(depth, t.size + s, t.prefix, nrAppend(depth + 1, node.size, node, t.deeper), new Affix(num + s, 2, a, suf.a));
  }
}

export function size(t: FingerTree<any>): number {
  return t.size;
}

// Concat

const buffer = new Array(12);
const digitBuffer = new Array(4);
let digitSize = 0;
let digitLen = 0;

function copy(b: any[], d: any[], left: number): void {
  b[left] = d[0];
  b[left + 1] = d[1];
  b[left + 2] = d[2];
  b[left + 3] = d[3];
}

function nodes(deep: boolean, suffix: Affix<any>, prefix: Affix<any>): void {
  let left = suffix.len;
  affixIntoArrayRev(suffix, 0, buffer);
  copy(buffer, digitBuffer, left);
  left += digitLen;
  affixIntoArray(prefix, left, buffer);
  left += prefix.len;
  let idx = 0;
  digitLen = 0;
  digitSize = 0;
  while (left > 4 || left === 3) {
    const size = deep === true ? buffer[idx].size + buffer[idx + 1].size + buffer[idx + 2].size : 3;
    digitBuffer[digitLen++] = new NNode(size, true, buffer[idx], buffer[idx + 1], buffer[idx + 2]);
    left -= 3;
    idx += 3;
    digitSize += size;
  }
  while (left !== 0) {
    const size = deep === true ? buffer[idx].size + buffer[idx + 1].size : 2;
    digitBuffer[digitLen++] = new NNode(size, false, buffer[idx], buffer[idx + 1]);
    digitSize += size;
    idx += 2;
    left -= 2;
  }
}

export function concat<A>(t1: FingerTree<A>, t2: FingerTree<A>): FingerTree<A> {
  if (t1 === nil) { return t2; }
  if (t2 === nil) { return t1; }
  digitSize = digitLen = 0;

  let topTree = deep(0, t1.size + t2.size, t1.prefix, nil, t2.suffix);
  nodes(false, t1.suffix, t2.prefix);
  t1 = <any>t1.deeper;
  t2 = <any>t2.deeper;
  let curTree = topTree;
  let depth = 1;

  while (t1 !== nil && t2 !== nil) {
    let newTree = deep(depth, t1.size + t2.size + digitSize, t1.prefix, nil, t2.suffix);
    nodes(true, t1.suffix, t2.prefix);
    t1 = <any>t1.deeper;
    t2 = <any>t2.deeper;
    curTree.deeper = <any>newTree;
    curTree = newTree;
    depth++;
  }
  if (t1 === nil) {
    for (let i = digitLen - 1; i >= 0; --i) {
      t2 = nrPrepend(depth, digitBuffer[i].size, digitBuffer[i], t2);
    }
    curTree.deeper = <any>t2;
  } else {
    for (let i = 0; i < digitLen; ++i) {
      t1 = nrAppend(depth, digitBuffer[i].size, digitBuffer[i], t1);
    }
    curTree.deeper = <any>t1;
  }
  return topTree;
}

// Get

function affixGet<A>(depth: number, idx: number, affix: Affix<any>): A {
  const { len, size, a, b, c, d } = affix;
  if (len === size) {
    return affix.get(idx);
  }
  let elm: any = a;
  let delta = a.size;
  while (idx >= delta) {
    delta += b.size;
    if (idx < delta) { elm = b; break; }
    delta += c.size;
    if (idx < delta) { elm = c; break; }
    delta += d.size;
    elm = d;
    break;
  }
  return nodeGet<A>(depth, idx - delta + elm.size, elm);
}

function affixGetRev<A>(depth: number, idx: number, affix: Affix<any>): A {
  const { len, size, a, b, c, d } = affix;
  if (len === size) {
    return affix.get(len - 1 - idx);
  }
  let elm: any = a;
  let delta = size - a.size;
  while (idx < delta) {
    delta -= b.size;
    if (delta <= idx) { elm = b; break; }
    delta -= c.size;
    if (delta <= idx) { elm = c; break; }
    delta -= d.size;
    elm = d;
    break;
  }
  return nodeGet<A>(depth, idx - delta, elm);
}

function nodeGet<A>(depth: number, idx: number, node: NNode<any>): A {
  while (--depth > 0) {
    let size = 0;
    if (idx < node.a.size) {
      node = node.a;
      idx -= size;
      continue;
    }
    size += node.a.size;
    if (idx < size + node.b.size) {
      node = node.b;
      idx -= size;
      continue;
    }
    size += node.b.size;
    if (idx < size + node.c.size) {
      node = node.c;
      idx -= size;
      continue;
    }
  }
  return node.get(idx);
}

export function get<A>(idx: number, tree: FingerTree<A>): A {
  let { size, prefix } = tree;
  if (size === 0) {
    return undefined;
  }
  let prefSize = tree.prefix.size;
  let deepSize = prefSize + tree.deeper.size;
  while (prefSize <= idx && idx < deepSize) {
    idx = idx - prefSize;
    tree = <any>tree.deeper;
    prefix = tree.prefix;
    prefSize = prefix.size;
    deepSize = prefSize + tree.deeper.size;
  }
  const { depth } = tree;
  if (idx < prefSize) {
    return affixGet<A>(depth, idx, prefix);
  } else {
    return affixGetRev<A>(depth, idx - deepSize, tree.suffix);
  }
}

// Fold

function nodeFoldl<A, B>(f: (b: B, a: A) => B, initial: B, node: Affix<any>, depth: number): B {
  if (depth === 1) {
    return f(f(f(initial, node.a), node.b), node.c);
  } else {
    const foldedA = nodeFoldl(f, initial, node.a, depth - 1);
    const foldedB = nodeFoldl(f, foldedA, node.b, depth - 1);
    const foldedC = nodeFoldl(f, foldedB, node.c, depth - 1);
    return foldedC;
  }
}

function affixFoldr<A, B>(f: (a: A, b: B) => B, initial: B, affix: Affix<any>): B {
  switch (affix.len) {
    case 0: return initial;
    case 1: return f(affix.a, initial);
    case 2: return f(affix.a, f(affix.b, initial));
    case 3: return f(affix.a, f(affix.b, f(affix.c, initial)));
    default: return f(affix.a, f(affix.b, f(affix.c, f(affix.d, initial))));
  }
}

function affixFoldl<A, B>(f: (b: B, a: A) => B, initial: B, affix: Affix<any>, depth: number): B {
  if (depth === 0) {
    switch (affix.len) {
      case 0: return initial;
      case 1: return f(initial, affix.a);
      case 2: return f(f(initial, affix.a), affix.b);
      case 3: return f(f(f(initial, affix.a), affix.b), affix.c);
      default: return f(f(f(f(initial, affix.a), affix.b), affix.c), affix.d);
    }
  } else {
    switch (affix.len) {
      case 0: return initial;
      case 1: return nodeFoldl(f, initial, affix.a, depth);
      case 2: return nodeFoldl(f, nodeFoldl(f, initial, affix.a, depth), affix.b, depth);
      case 3: return nodeFoldl(f, nodeFoldl(f, nodeFoldl(f, initial, affix.a, depth), affix.b, depth), affix.c, depth);
      default: return nodeFoldl(f, nodeFoldl(f, nodeFoldl(f, nodeFoldl(f, initial, affix.a, depth), affix.b, depth), affix.c, depth), affix.d, depth);
    }
  }
}

function affixFoldlRev<A, B>(f: (b: B, a: A) => B, initial: B, affix: Affix<any>, depth: number): B {
  if (depth === 0) {
    switch (affix.len) {
      case 0: return initial;
      case 1: return f(initial, affix.a);
      case 2: return f(f(initial, affix.b), affix.a);
      case 3: return f(f(f(initial, affix.c), affix.b), affix.a);
      default: return f(f(f(f(initial, affix.d), affix.c), affix.b), affix.a);
    }
  } else {
    switch (affix.len) {
      case 0: return initial;
      case 1: return nodeFoldl(f, initial, affix.a, depth);
      case 2: return nodeFoldl(f, nodeFoldl(f, initial, affix.b, depth), affix.a, depth);
      case 3: return nodeFoldl(f, nodeFoldl(f, nodeFoldl(f, initial, affix.c, depth), affix.b, depth), affix.a, depth);
      default: return nodeFoldl(f, nodeFoldl(f, nodeFoldl(f, nodeFoldl(f, initial, affix.d, depth), affix.c, depth), affix.b, depth), affix.a, depth);
    }
  }
}

export function foldl<A, B>(f: (b: B, a: A) => B, initial: B, list: FingerTree<A>): B {
  const { size, prefix, deeper, suffix, depth } = list;
  if (size === 0) {
    return initial;
  } else {
    const foldedSuffix = suffix === undefined ? initial : affixFoldlRev(f, initial, suffix, depth);
    const foldedMiddle = deeper === undefined ? foldedSuffix : foldl<A, B>(f, foldedSuffix, <any>deeper);
    return prefix === undefined ? foldedMiddle : affixFoldl(f, foldedMiddle, prefix, depth);
  }
}

function flatten<A>(a: NNode<A>[]): A[] {
  let array: A[] = [];
  for (let i = 0; i < a.length; ++i) {
    const e = a[i];
    array.push(e.a);
    array.push(e.b);
    if (e.three === true) {
      array.push(e.c);
    }
  }
  return array;
}

export function toArray<A>(t: FingerTree<A>): A[] {
  if (t.size === 0) {
    return [];
  } else {
    return t.prefix.toArray().concat(flatten(toArray(t.deeper))).concat(t.suffix.toArray().reverse());
  }
}
