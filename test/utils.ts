import { Applicative } from "../src";

export abstract class Maybe<A> implements Applicative<A> {
  static "fantasy-land/of"<B>(v: B): Maybe<B> {
    return just(v);
  }
  abstract "fantasy-land/chain"<B>(f: (a: A) => Maybe<B>): Maybe<B>;
  abstract "fantasy-land/map"<B>(f: (a: A) => B): Maybe<B>;
  abstract "fantasy-land/ap"<B>(a: Applicative<(a: A) => B>): Applicative<B>;
}

class Nothing<A> extends Maybe<A> {
  constructor() {
    super();
  }
  "fantasy-land/chain"<B>(_f: (v: A) => Maybe<B>): Maybe<B> {
    return nothing;
  }
  "fantasy-land/map"<B>(_f: (a: A) => B): Maybe<B> {
    return nothing;
  }
  "fantasy-land/ap"<B>(_a: Maybe<(a: A) => B>): Maybe<B> {
    return nothing;
  }
}

export class Just<A> extends Maybe<A> {
  constructor(readonly val: A) {
    super();
  }
  "fantasy-land/chain"<B>(f: (v: A) => Maybe<B>): Maybe<B> {
    return f(this.val);
  }
  "fantasy-land/map"<B>(f: (a: A) => B): Maybe<B> {
    return new Just(f(this.val));
  }
  "fantasy-land/ap"<B>(m: Maybe<(a: A) => B>): Maybe<B> {
    return isJust(m) ? new Just(m.val(this.val)) : nothing;
  }
}

export function isJust(m: Maybe<any>): m is Just<any> {
  return m !== nothing;
}

export function just<V>(v: V): Maybe<V> {
  return new Just(v);
}

export const nothing: Maybe<any> = new Nothing();
