export class Affix<A> {
  constructor(
    public size: number,
    public len: number,
    public a: A,
    public b?: A,
    public c?: A,
    public d?: A
  ) {};
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
    case 3: return this.d;
    }
  }
  getRev(idx: number): A {
    switch (this.len - 1 - idx) {
    case 0: return this.a;
    case 1: return this.b;
    case 2: return this.c;
    case 3: return this.d;
    }
  }
}

function affixPrepend<A>(s: number, a: A, as: Affix<A>): Affix<A> {
  return new Affix(as.size + s, as.len + 1, a, as.a, as.b, as.c);
}

function flatten<A>(a: NNode<A>[]): A[] {
  let arr: A[] = [];
  for (let i = 0; i < a.length; ++i) {
    const e = a[i];
    arr.push(e.a);
    arr.push(e.b);
    if (e.three === true) {
      arr.push(e.c);
    }
  }
  return arr;
}

// Node in a 2-3 tree
// export type NNode<A> = [A, A] | [A, A, A];
export class NNode<A> {
  constructor(
    public size: number, // number of elements in tree
    public three: boolean, // true is the node has three elements
    public a: A,
    public b: A,
    public c: A,
  ) {};
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
    public type: number,
    public depth: number,
    public size: number,
    public prefix: Affix<A>,
    public deeper: FingerTree<NNode<A>>,
    public suffix: Affix<A>
  ) {};
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

export function nrPrepend<A>(depth: number, s: number, a: A, t: FingerTree<A>): FingerTree<A> {
  switch (t.type) {
  case 0: return single(depth, s, a);
  case 1: return deep(depth, t.size + s, new Affix(s, 1, a), nil, new Affix(t.size, 1, singleA(t)));
  case 2: return nrPrependDeep<A>(t.prefix, depth, t, s, a);
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

function affixGet<A>(depth: number, idx: number, a: Affix<any>): A {
  if (a.len === a.size) {
    return a.get(idx);
  } else {
    let size = 0;
    if (idx < a.a.size) {
      return nodeGet<A>(depth, idx - size, a.a);
    }
    size += a.a.size;
    if (idx < size + a.b.size) {
      return nodeGet<A>(depth, idx - size, a.b);
    }
    size += a.b.size;
    if (idx < size + a.c.size) {
      return nodeGet<A>(depth, idx - size, a.c);
    }
    size += a.c.size;
    return nodeGet<A>(depth, idx - size, a.d);
  }
}

function affixGetRev<A>(depth: number, idx: number, a: Affix<any>): A {
  if (a.len === a.size) {
    return a.getRev(idx);
  } else {
    let size = 0;
    if (a.len === 4) {
      if (idx < a.d.size) {
        return nodeGet<A>(depth, idx - size, a.d);
      }
      size += a.d.size;
    }
    if (a.len >= 3) {
      if (idx < size + a.c.size) {
        return nodeGet<A>(depth, idx - size, a.c);
      }
      size += a.c.size;
    }
    if (a.len >= 2) {
      if (idx < size + a.b.size) {
        return nodeGet<A>(depth, idx - size, a.b);
      }
      size += a.b.size;
    }
    return nodeGet<A>(depth, idx - size, a.a);
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

export function get<A>(idx: number, t: FingerTree<A>): A {
  switch (t.type) {
  case 0: return undefined;
  case 1:
    if (t.depth !== 0) {
      return nodeGet<A>(t.depth, idx, (<any>singleA(t)));
    } else {
      return idx === 0 ? singleA(t) : undefined;
    }
  case 2:
    const prefSize = t.prefix.size;
    const deep = prefSize + t.deeper.size;
    if (idx < prefSize) {
      return affixGet<A>(t.depth, idx, t.prefix);
    } else if (idx < deep) {
      return get<A>(idx - prefSize, <any>t.deeper);
    } else {
      return affixGetRev<A>(t.depth, idx - deep, t.suffix);
    }
  }
}

export function toArray<A>(t: FingerTree<A>): A[] {
  switch (t.type) {
  case 0: return [];
  case 1: return [singleA(t)];
  case 2: return t.prefix.toArray().concat(flatten(toArray(t.deeper))).concat(t.suffix.toArray().reverse());
  }
}
