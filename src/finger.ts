export interface Sizeable {
  size(): number;
}

export class Affix<A> implements Sizeable {
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
  size() {
    return this.len;
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

function flatten<A extends Sizeable>(a: NNode<A>[]): A[] {
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

export type FingerTree<A> = Empty | Single<A> | Deep<A>;

export class Empty {
  constructor() {};
  size() {
    return 0;
  }
}

export const nil = new Empty();

// Node in a 2-3 tree
// export type NNode<A> = [A, A] | [A, A, A];
export class NNode<A extends Sizeable> implements Sizeable {
  public _size: number;
  constructor(
    public three: boolean, // true is the node has three elements
    public a: A,
    public b: A,
    public c: A,
  ) {
    this._size = a.size() + b.size();
    if (three) {
      this._size += c.size();
    }
  };
  size() {
    return this._size;
  }
}

export class Single<A> {
  constructor(public a: A) {};
}

export class Deep<A> {
  constructor(
    public size: number,
    public prefix: Affix<A>,
    public deeper: FingerTree<NNode<A>>,
    public suffix: Affix<A>
  ) {};
}

export function prepend<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  if (t === undefined) {
    return new Single(a);
  } else if (t instanceof Single) {
    return new Deep(2, new Affix(1, a), undefined, new Affix(1, t.a));
  } else {
    const n = t.size + 1;
    const p = t.prefix;
    if (p.len < 4) {
      return new Deep(n, affixPrepend(a, t.prefix), t.deeper, t.suffix);
    } else {
      return new Deep(
        n, new Affix(2, a, p.a), prepend(new NNode(true, p.b, p.c, p.d), t.deeper), t.suffix
      );
    }
  }
}

export function append<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  if (t === undefined) {
    return new Single(a);
  } else if (t instanceof Single) {
    return new Deep(2, new Affix(1, t.a), undefined, new Affix(1, a));
  } else {
    const n = t.size + 1;
    const s = t.suffix;
    if (s.len < 4) {
      return new Deep(n, t.prefix, t.deeper, affixAppend(a, t.suffix));
    } else {
      return new Deep(n, t.prefix, append(new NNode(true, s.a, s.b, s.c), t.deeper), new Affix(2, s.d, a));
      // const result = new Deep(t.prefix, undefined, new Affix(2, s.d, a));
      // deepAppend(<[A, A, A]>[s.a, s.b, s.c], t.deeper, result);
      // return result;
    }
  }
}

function deepAppend<A>(a: any, t: FingerTree<any>, p: Deep<A>): void {
  while (t instanceof Deep && t.suffix.len === 4) {
    const s = t.suffix;
    const newDeep = new Deep(t.size + 1,
      t.prefix, undefined, new Affix(2, s.d, a)
    );
    p.deeper = newDeep;
    p = newDeep;
    a = [s.a, s.b, s.c];
    t = t.deeper;
  }
  if (t === undefined) {
    p.deeper = new Single(a);
  } else if (t instanceof Single) {
    p.deeper = new Deep(4, new Affix(1, t.a), undefined, new Affix(1, a));
  } else {
    p.deeper = new Deep(t.size + 1, t.prefix, t.deeper, affixAppend(a, t.suffix));
  }
}

export function size(t: FingerTree<any>): number {
  if (t === undefined) {
    return 0;
  } else if (t instanceof Single) {
    return 1;
  } else {
    return t.size;
  }
}

export function get<A>(idx: number, t: FingerTree<A>): A {
  if (t === undefined) {
    return undefined;
  } else if (t instanceof Single) {
    return idx === 0 ? t.a : undefined;
  } else {
    return t.suffix.a;
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
