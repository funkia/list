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
    public type: number, // 0: nil, 1: single, 2: deep
    public depth: number,
    public size: number,
    public prefix: Affix<A>,
    public deeper: FingerTree<NNode<A>>,
    public suffix: Affix<A>
  ) { };
}

export const nil = new FingerTree<any>(
  0, 0, 0, undefined, undefined, undefined
);

function single<A>(depth: number, size: number, a: A): FingerTree<A> {
  return new FingerTree<A>(1, depth, size, <any>a, nil, undefined);
}

function deep<A>(
  depth: number, size: number, prefix: Affix<A>,
  deeper: FingerTree<NNode<A>>, suffix: Affix<A>
): FingerTree<A> {
  return new FingerTree(2, depth, size, prefix, deeper, suffix);
}

function singleA<A>(t: FingerTree<A>): A {
  return (<any>t).prefix;
}

export function prepend<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  return nrPrepend(0, 1, a, t);
}

export function nrPrepend<A>(depth: number, size: number, a: A, t: FingerTree<A>): FingerTree<A> {
  switch (t.type) {
    case 0: return single(depth, size, a);
    case 1: return deep(depth, t.size + size, new Affix(size, 1, a), nil, new Affix(t.size, 1, singleA(t)));
    case 2: return nrPrependDeep<A>(t.prefix, depth, t, size, a);
  }
}

function nrPrependDeep<A>(p: Affix<A>, depth: number, t: FingerTree<A>, s: number, a: A): FingerTree<A> {
  if (p.len < 4) {
    return deep(depth, t.size + s, affixPrepend(s, a, t.prefix), t.deeper, t.suffix);
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

function nrAppend<A>(depth: number, s: number, a: A, t: FingerTree<A>): FingerTree<A> {
  switch (t.type) {
    case 0: return single(depth, s, a);
    case 1: return deep(depth, t.size + s, new Affix(t.size, 1, singleA(t)), nil, new Affix(s, 1, a));
    case 2: return nrAppendDeep<A>(t.suffix, depth, t, s, a);
  }
}

function nrAppendDeep<A>(suf: Affix<A>, depth: number, t: FingerTree<A>, s: number, a: A): FingerTree<A> {
  if (suf.len < 4) {
    return deep(depth, t.size + s, t.prefix, t.deeper, affixPrepend(s, a, t.suffix));
  }
  const num = depth ? (<any>suf.a).size : 1;
  const node = new NNode(suf.size - num, true, suf.d, suf.c, suf.b);
  return deep(depth, t.size + s, t.prefix, nrAppend(depth + 1, node.size, node, t.deeper), new Affix(num + s, 2, a, suf.a));
}

export function size(t: FingerTree<any>): number {
  return t.size;
}

function affixGet<A>(depth: number, idx: number, affix: Affix<any>): A {
  const {len, size, a, b, c, d} = affix;
  if (len === size) {
    return affix.get(idx);
  } else {
    let delta = 0;
    if (idx < a.size) {
      return nodeGet<A>(depth, idx - delta, a);
    }
    delta += a.size;
    if (idx < delta + b.size) {
      return nodeGet<A>(depth, idx - delta, b);
    }
    delta += b.size;
    if (idx < delta + c.size) {
      return nodeGet<A>(depth, idx - delta, c);
    }
    delta += c.size;
    return nodeGet<A>(depth, idx - delta, d);
  }
}

function affixGetRev<A>(depth: number, idx: number, affix: Affix<any>): A {
  const {len, size, a, b, c, d} = affix;
  if (len === size) {
    return affix.get(len - 1 - idx);
  } else {
    let delta = size - a.size;
    if (delta <= idx) {
      return nodeGet<A>(depth, idx - delta, a);
    }
    delta -= b.size;
    if (delta <= idx) {
      return nodeGet<A>(depth, idx - delta, b);
    }
    delta -= c.size;
    if (delta <= idx) {
      return nodeGet<A>(depth, idx - delta, c);
    }
    return nodeGet<A>(depth, idx, d);
  }
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
  let prefSize = tree.prefix.size;
  let deep = prefSize + tree.deeper.size;
  while (tree.type === 2 && prefSize <= idx && idx < deep) {
    idx = idx - prefSize;
    tree = <any>tree.deeper;
    prefSize = tree.prefix.size;
    deep = prefSize + tree.deeper.size;
  }
  const {depth} = tree;
  switch (tree.type) {
    case 2:
      if (idx < prefSize) {
        return affixGet<A>(depth, idx, tree.prefix);
      } else {
        return affixGetRev<A>(depth, idx - deep, tree.suffix);
      }
    case 1:
      if (depth !== 0) {
        return nodeGet<A>(depth, idx, (<any>singleA(tree)));
      } else {
        return idx === 0 ? singleA(tree) : undefined;
      }
    default: // 0
      return undefined;
  }
}

export function toArray<A>(t: FingerTree<A>): A[] {
  switch (t.type) {
    case 0: return [];
    case 1: return [singleA(t)];
    case 2: return t.prefix.toArray().concat(flatten(toArray(t.deeper))).concat(t.suffix.toArray().reverse());
  }
}
