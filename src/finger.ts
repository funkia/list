export class Affix<A>{
  constructor(
    public len: number,
    public a: A,
    public b?: A,
    public c?: A,
    public d?: A
  ) {};
  toArray(): A[] {
    switch(this.len) {
    case 1: return [this.a];
    case 2: return [this.a, this.b];
    case 3: return [this.a, this.b, this.c];
    case 4: return [this.a, this.b, this.c, this.d];
    }
  }
}

function affixPrepend<A>(a: A, as: Affix<A>): Affix<A> {
  return new Affix(as.len + 1, a, as.a, as.b, as.c);
}

function affixAppend<A>(a: A, as: Affix<A>): Affix<A> {
  switch(as.len) {
  case 1: return new Affix(2, as.a, a);
  case 2: return new Affix(3, as.a, as.b, a);
  case 3: return new Affix(4, as.a, as.b, as.c, a);
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

export type FingerTree<A> = undefined | Single<A> | Deep<A>;

// Node in a 2-3 tree
// export type NNode<A> = [A, A] | [A, A, A];
export class NNode<A> {
  constructor(
    public three: boolean, // true is the node has three elements
    public a: A,
    public b: A,
    public c: A,
  ) {};
}

export class Single<A> {
  constructor(public a: A) {};
}

export class Deep<A> {
  constructor(
    public prefix: Affix<A>,
    public deeper: FingerTree<NNode<A>>,
    public suffix: Affix<A>
  ) {};
}

export function prepend<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  if (t === undefined) {
    return new Single(a);
  } else if (t instanceof Single) {
    return new Deep(new Affix(1, a), undefined, new Affix(1, t.a));
  } else {
    const p = t.prefix;
    if (p.len < 4) {
      return new Deep(affixPrepend(a, t.prefix), t.deeper, t.suffix);
    } else {
      return new Deep(
        new Affix(2, a, p.a), prepend(new NNode(true, p.b, p.c, p.d), t.deeper), t.suffix
      );
    }
  }
}

export function append<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  if (t === undefined) {
    return new Single(a);
  } else if (t instanceof Single) {
    return new Deep(new Affix(1, t.a), undefined, new Affix(1, a));
  } else {
    const s = t.suffix;
    if (s.len < 4) {
      return new Deep(t.prefix, t.deeper, affixAppend(a, t.suffix));
    } else {
      return new Deep(t.prefix, append(new NNode(true, s.a, s.b, s.c), t.deeper), new Affix(2, s.d, a));
    }
  }
}

export function toArray<A>(t: FingerTree<A>): A[] {
  if (t === undefined) {
    return [];
  } else if (t instanceof Single) {
    return [t.a];
  } else {
    return t.prefix.toArray().concat(flatten(toArray(t.deeper))).concat(t.suffix.toArray());
  }
}
