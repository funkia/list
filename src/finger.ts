export class Affix<A> {
  constructor(
    public size: number,
    public len: number,
    public a: A,
    public b?: A,
    public c?: A,
    public d?: A
  ) { };
  toArray(): A[] {
    switch (this.len) {
    case 0: return [];
    case 1: return [this.a];
    case 2: return [this.a, this.b];
    case 3: return [this.a, this.b, this.c];
    case 4: return [this.a, this.b, this.c, this.d];
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

const emptyAffix: Affix<any> = new Affix(0, 0, undefined);

function affixPrepend<A>(size: number, a: A, as: Affix<A>): Affix<A> {
  return new Affix(as.size + size, as.len + 1, a, as.a, as.b, as.c);
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

// Node in a 2-3 tree
// export type NNode<A> = [A, A] | [A, A, A];
export class NNode<A> {
  constructor(
    public size: number, // number of elements in tree
    public three: boolean, // true if the node has three elements
    public a: A,
    public b: A,
    public c: A,
  ) { };
  get(idx: number): A {
    switch (idx) {
      case 0: return this.a;
      case 1: return this.b;
      case 2: return this.c;
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
  ) { };
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

function affixGet<A>(depth: number, idx: number, affix: Affix<any>): A {
  const {len, size, a, b, c, d} = affix;
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
  const {len, size, a, b, c, d} = affix;
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
  let {size, prefix} = tree;
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
  const {depth} = tree;
  if (idx < prefSize) {
    return affixGet<A>(depth, idx, prefix);
  } else {
    return affixGetRev<A>(depth, idx - deepSize, tree.suffix);
  }
}

// Fold

function nodeFoldLeft<A, B>(f: (b: B, a: A) => B, initial: B, node: Affix<any>, depth: number): B {
  if (depth === 1) {
    return f(f(f(initial, node.a), node.b), node.c);
  } else {
    const foldedA = nodeFoldLeft(f, initial, node.a, depth - 1);
    const foldedB = nodeFoldLeft(f, foldedA, node.b, depth - 1);
    const foldedC = nodeFoldLeft(f, foldedB, node.c, depth - 1);
    return foldedC;
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
    case 1: return nodeFoldLeft(f, initial, affix.a, depth);
    case 2: return nodeFoldLeft(f, nodeFoldLeft(f, initial, affix.a, depth), affix.b, depth);
    case 3: return nodeFoldLeft(f, nodeFoldLeft(f, nodeFoldLeft(f, initial, affix.a, depth), affix.b, depth), affix.c, depth);
    default: return nodeFoldLeft(f, nodeFoldLeft(f, nodeFoldLeft(f, nodeFoldLeft(f, initial, affix.a, depth), affix.b, depth), affix.c, depth), affix.d, depth);
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
    case 1: return nodeFoldLeft(f, initial, affix.a, depth);
    case 2: return nodeFoldLeft(f, nodeFoldLeft(f, initial, affix.b, depth), affix.a, depth);
    case 3: return nodeFoldLeft(f, nodeFoldLeft(f, nodeFoldLeft(f, initial, affix.c, depth), affix.b, depth), affix.a, depth);
    default: return nodeFoldLeft(f, nodeFoldLeft(f, nodeFoldLeft(f, nodeFoldLeft(f, initial, affix.d, depth), affix.c, depth), affix.b, depth), affix.a, depth);
    }
  }
}

export function foldl<A, B>(f: (b: B, a: A) => B, initial: B, list: FingerTree<A>): B {
  const {size, prefix, deeper, suffix, depth} = list;
  if (size === 0) {
    return initial;
  } else {
    const foldedSuffix = suffix === undefined ? initial : affixFoldlRev(f, initial, suffix, depth);
    const foldedMiddle = deeper === undefined ? foldedSuffix : foldl<A, B>(f, foldedSuffix, <any>deeper);
    return prefix === undefined ? foldedMiddle : affixFoldl(f, foldedMiddle, prefix, depth);
  }
}

export function toArray<A>(t: FingerTree<A>): A[] {
  if (t.size === 0) {
    return [];
  } else {
    return t.prefix.toArray().concat(flatten(toArray(t.deeper))).concat(t.suffix.toArray().reverse());
  }
}
