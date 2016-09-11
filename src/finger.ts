type Affix<A> = [A] | [A, A] | [A, A, A] | [A, A, A, A];

function affixPrepend<A>(a: A, as: Affix<A>): Affix<A> {
  return <Affix<A>>[a, ...as];
}

function affixAppend<A>(a: A, as: Affix<A>): Affix<A> {
  return <Affix<A>>[...as, a];
}

function flatten<A>(a: A[][]): A[] {
  let arr: A[] = [];
  for (let i = 0; i < a.length; ++i) {
    for (let j = 0; j < a[i].length; ++j) {
      arr.push(a[i][j]);
    }
  }
  return arr;
}

export type FingerTree<A> = undefined | Single<A> | Deep<A>;

// Node in a 2-3 tree
type NNode<A> = [A, A] | [A, A, A];

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
    return new Deep([a], undefined, [t.a]);
  } else {
    const p = t.prefix;
    if (p.length < 4) {
      return new Deep(affixPrepend(a, t.prefix), t.deeper, t.suffix);
    } else {
      return new Deep(
        [a, p[0]], prepend(<[A, A, A]>[p[1], p[2], p[3]], t.deeper), t.suffix
      );
    }
  }
}

export function append<A>(a: A, t: FingerTree<A>): FingerTree<A> {
  if (t === undefined) {
    return new Single(a);
  } else if (t instanceof Single) {
    return new Deep([t.a], undefined, [a]);
  } else {
    const s = t.suffix;
    if (s.length < 4) {
      return new Deep(t.prefix, t.deeper, affixAppend(a, t.suffix));
    } else {
      return new Deep(
        t.prefix, append(<[A, A, A]>[s[0], s[1], s[2]], t.deeper), [s[3], a]
      );
    }
  }
}

export function toArray<A>(t: FingerTree<A>): A[] {
  if (t === undefined) {
    return [];
  } else if (t instanceof Single) {
    return [t.a];
  } else {
    return t.prefix.concat(flatten(toArray(t.deeper))).concat(t.suffix);
  }
}
