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

function affixAppend<A>(s: number, a: A, as: Affix<A>): Affix<A> {
  const newSize = as.size + s;
  switch (as.len) {
  case 1: return new Affix(newSize, 2, as.a, a);
  case 2: return new Affix(newSize, 3, as.a, as.b, a);
  case 3: return new Affix(newSize, 4, as.a, as.b, as.c, a);
  }
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

export type FingerTree<A> = Empty | Single<A> | Deep<A>;

export class Empty {
  public size: number = 0;
  constructor() {};
  isNil(): boolean {
    return true;
  }
  getType(): 0 {
    return 0;
  }
}

export const nil = new Empty();

function isNil(t: FingerTree<any>): t is Empty {
  return t === nil;
}

export class Single<A> {
  constructor(
    public nested: boolean,
    public size: number,
    public a: A
  ) {};
  getType(): 1 {
    return 1;
  }
}

export class Deep<A> {
  constructor(
    public nested: boolean,
    public size: number,
    public prefix: Affix<A>,
    public deeper: FingerTree<NNode<A>>,
    public suffix: Affix<A>
  ) {};
  getType(): 2 {
    return 2;
  }
}

export function prepend<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  return nrPrepend(false, 1, a, t);
}

export function nrPrepend<A>(nested: boolean, s: number, a: A, t: FingerTree<A>): FingerTree<A> {
  const m = t.size + 1;
  switch (t.getType()) {
  case 0: return new Single(nested, s, a);
  case 1: return new Deep(nested, t.size + s, new Affix(s, 1, a), nil, new Affix(t.size, 1, (<Single<A>>t).a));
  case 2: return nrPrependDeep<A>((<Deep<A>>t).prefix, nested, m, <Deep<A>>t, s, a);
  }
}

function nrPrependDeep<A>(p: Affix<A>, nested: boolean, m: number, t: Deep<A>, s: number, a: A): FingerTree<A> {
  if (p.len < 4) {
    return new Deep(nested, m, affixPrepend(s, a, t.prefix), t.deeper, t.suffix);
  } else {
    const num = nested ? (<any>p.a).size : 1;
    const node = new NNode(p.size - num, true, p.b, p.c, p.d);
    return new Deep(
      nested, m, new Affix(s + num, 2, a, p.a), nrPrepend(true, node.size, node, t.deeper), t.suffix
    );
  }
}

export function append<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  return nrAppend(false, 1, a, t);
}

function nrAppend<A>(n: boolean, s: number, a: A, t: FingerTree<A>): FingerTree<A> {
  const m = t.size + s;
  switch (t.getType()) {
  case 0: return new Single(n, s, a);
  case 1: return new Deep(n, m, new Affix(t.size, 1, (<Single<A>>t).a), nil, new Affix(s, 1, a));
  case 2: return nrAppendDeep<A>((<Deep<A>>t).suffix, n, m, <Deep<A>>t, s, a);
  }
}

function nrAppendDeep<A>(suf: Affix<A>, n: boolean, m: number, t: Deep<A>, s: number, a: A): FingerTree<A> {
  if (suf.len < 4) {
    return new Deep(n, m, t.prefix, t.deeper, affixAppend(s, a, t.suffix));
  } else {
    const num = n ? (<any>suf.d).size : 1;
    const node = new NNode(suf.size - num, true, suf.a, suf.b, suf.c);
    return new Deep(n, m, t.prefix, nrAppend(true, node.size, node, t.deeper), new Affix(num + s, 2, suf.d, a));
  }
}
// const result = new Deep(t.prefix, undefined, new Affix(2, s.d, a));
// deepAppend(<[A, A, A]>[s.a, s.b, s.c], t.deeper, result);
// return result;

// function deepAppend<A>(a: any, t: FingerTree<any>, p: Deep<A>): void {
//   while (t instanceof Deep && t.suffix.len === 4) {
//     const s = t.suffix;
//     const newDeep = new Deep(t.size + 1,
//       t.prefix, nil, new Affix(2, s.d, a)
//     );
//     p.deeper = newDeep;
//     p = newDeep;
//     a = [s.a, s.b, s.c];
//     t = t.deeper;
//   }
//   if (t instanceof Empty) {
//     p.deeper = new Single(a);
//   } else if (t instanceof Single) {
//     p.deeper = new Deep(4, new Affix(1, t.a), nil, new Affix(1, a));
//   } else {
//     p.deeper = new Deep(t.size + 1, t.prefix, t.deeper, affixAppend(a, t.suffix));
//   }
// }

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
  if (t instanceof Empty) {
    return undefined;
  } else if (t instanceof Single) {
    if (t.nested === true) {
      return nodeGet<A>(idx, <any>t.a);
    } else {
      return idx === 0 ? t.a : undefined;
    }
  } else {
    const prefSize = t.prefix.size;
    const deep = prefSize + t.deeper.size;
    if (idx < prefSize) {
      return affixGet<A>(idx, t.prefix);
    } else if (idx < deep) {
      return get<A>(idx - prefSize, <any>t.deeper);
    } else {
      return affixGet<A>(idx - deep, t.suffix);
    }
  }
}

export function toArray<A>(t: FingerTree<A>): A[] {
  if (t instanceof Empty) {
    return [];
  } else if (t instanceof Single) {
    return [t.a];
  } else {
    return t.prefix.toArray().concat(flatten(toArray(t.deeper))).concat(t.suffix.toArray());
  }
}
