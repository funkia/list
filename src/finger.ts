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
}

export class FingerTree<A> {
  constructor(
    public type: number,
    public nested: boolean,
    public size: number,
    public prefix: Affix<A>,
    public deeper: FingerTree<NNode<A>>,
    public suffix: Affix<A>
  ) {};
}

export const nil = new FingerTree<any>(
  0, false, 0, undefined, undefined, undefined
);

function single<A>(nested: boolean, size: number, a: A): FingerTree<A> {
  return new FingerTree<A>(1, nested, size, <any>a, nil, undefined);
}

function deep<A>(
  nested: boolean, size: number, prefix: Affix<A>,
  deeper: FingerTree<NNode<A>>, suffix: Affix<A>
): FingerTree<A> {
  return new FingerTree(2, nested, size, prefix, deeper, suffix);
}

function singleA<A>(t: FingerTree<A>): A {
  return (<any>t).prefix;
}

export function prepend<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  return nrPrepend(false, 1, a, t);
}

export function nrPrepend<A>(nested: boolean, s: number, a: A, t: FingerTree<A>): FingerTree<A> {
  const m = t.size + 1;
  switch (t.type) {
  case 0: return single(nested, s, a);
  case 1: return deep(nested, t.size + s, new Affix(s, 1, a), nil, new Affix(t.size, 1, singleA(t)));
  case 2: return nrPrependDeep<A>(t.prefix, nested, m, t, s, a);
  }
}

function nrPrependDeep<A>(p: Affix<A>, nested: boolean, m: number, t: FingerTree<A>, s: number, a: A): FingerTree<A> {
  if (p.len < 4) {
    return deep(nested, m, affixPrepend(s, a, t.prefix), t.deeper, t.suffix);
  } else {
    const num = nested ? (<any>p.a).size : 1;
    const node = new NNode(p.size - num, true, p.b, p.c, p.d);
    return deep(
      nested, m, new Affix(s + num, 2, a, p.a), nrPrepend(true, node.size, node, t.deeper), t.suffix
    );
  }
}

export function append<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  return nrAppend(false, 1, a, t);
}

function nrAppend<A>(n: boolean, s: number, a: A, t: FingerTree<A>): FingerTree<A> {
  switch (t.type) {
  case 0: return single(n, s, a);
  case 1: return deep(n, t.size + s, new Affix(t.size, 1, singleA(t)), nil, new Affix(s, 1, a));
  case 2: return nrAppendDeep<A>(t.suffix, n, t.size + s, t, s, a);
  }
}

function nrAppendDeep<A>(suf: Affix<A>, n: boolean, m: number, t: FingerTree<A>, s: number, a: A): FingerTree<A> {
  if (suf.len < 4) {
    return deep(n, m, t.prefix, t.deeper, affixPrepend(s, a, t.suffix));
  }
  const num = n ? (<any>suf.a).size : 1;
  const node = new NNode(suf.size - num, true, suf.d, suf.c, suf.b);
  return deep(n, m, t.prefix, nrAppend(true, node.size, node, t.deeper), new Affix(num + s, 2, a, suf.a));
}

export function size(t: FingerTree<any>): number {
  return t.size;
}

function affixGet<A>(idx: number, a: Affix<any>): A {
  if (a.len === a.size) {
    switch (idx) {
    case 0: return a.a;
    case 1: return a.b;
    case 2: return a.c;
    case 3: return a.d;
    }
  } else {
    let size = 0;
    if (idx < a.a.size) {
      return nodeGet<A>(idx - size, a.a);
    }
    size += a.a.size;
    if (idx < size + a.b.size) {
      return nodeGet<A>(idx - size, a.b);
    }
    size += a.b.size;
    if (idx < size + a.c.size) {
      return nodeGet<A>(idx - size, a.c);
    }
    size += a.c.size;
    return nodeGet<A>(idx - size, a.d);
  }
}

function affixGetRev<A>(idx: number, a: Affix<any>): A {
  if (a.len === a.size) {
    switch (a.len - 1 - idx) {
    case 0: return a.a;
    case 1: return a.b;
    case 2: return a.c;
    case 3: return a.d;
    }
  } else {
    let size = 0;
    if (a.len === 4) {
      if (idx < a.d.size) {
        return nodeGet<A>(idx - size, a.d);
      }
      size += a.d.size;
    }
    if (a.len >= 3) {
      if (idx < size + a.c.size) {
        return nodeGet<A>(idx - size, a.c);
      }
      size += a.c.size;
    }
    if (a.len >= 2) {
      if (idx < size + a.b.size) {
        return nodeGet<A>(idx - size, a.b);
      }
      size += a.b.size;
    }
    return nodeGet<A>(idx - size, a.a);
  }
}

function nodeGet<A>(idx: number, n: NNode<any>): A {
  if (n.size === 3 && n.three === true) {
    // Leaf!
    switch (idx) {
    case 0: return n.a;
    case 1: return n.b;
    case 2: return n.c;
    }
  } else {
    let size = 0;
    if (idx < n.a.size) {
      return nodeGet<A>(idx - size, n.a);
    }
    size += n.a.size;
    if (idx < size + n.b.size) {
      return nodeGet<A>(idx - size, n.b);
    }
    size += n.b.size;
    if (idx < size + n.c.size) {
      return nodeGet<A>(idx - size, n.c);
    }
  }
}

export function get<A>(idx: number, t: FingerTree<A>): A {
  switch (t.type) {
  case 0: return undefined;
  case 1:
    if (t.nested === true) {
      return nodeGet<A>(idx, <any>singleA(t));
    } else {
      return idx === 0 ? singleA(t) : undefined;
    }
  case 2:
    const prefSize = t.prefix.size;
    const deep = prefSize + t.deeper.size;
    if (idx < prefSize) {
      return affixGet<A>(idx, t.prefix);
    } else if (idx < deep) {
      return get<A>(idx - prefSize, <any>t.deeper);
    } else {
      return affixGetRev<A>(idx - deep, t.suffix);
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
