import {
  List,
  equals,
  map,
  filter,
  empty,
  concat,
  foldl,
  of,
  ap,
  chain
} from "./index";

declare module "./index" {
  interface List<A> {
    "fantasy-land/equals"(l: List<A>): boolean;
    "fantasy-land/map"<B>(f: (a: A) => B): List<B>;
    "fantasy-land/of"<B>(b: B): List<B>;
    "fantasy-land/ap"<B>(f: List<(a: A) => B>): List<B>;
    "fantasy-land/chain"<B>(f: (a: A) => List<B>): List<B>;
    "fantasy-land/filter"(predicate: (a: A) => boolean): List<A>;
    "fantasy-land/empty"(): List<any>;
    "fantasy-land/concat"(right: List<A>): List<A>;
    "fantasy-land/reduce"<B>(f: (acc: B, value: A) => B, initial: B): B;
  }
}

List.prototype["fantasy-land/equals"] = function<A>(l: List<A>): boolean {
  return equals(this, l);
};

List.prototype["fantasy-land/map"] = function<A, B>(f: (a: A) => B): List<B> {
  return map(f, this);
};

List.prototype["fantasy-land/of"] = of;

List.prototype["fantasy-land/ap"] = function<A, B>(
  listF: List<(a: A) => B>
): List<B> {
  return ap(listF, this);
};

List.prototype["fantasy-land/chain"] = function<A, B>(
  f: (a: A) => List<B>
): List<B> {
  return chain(f, this);
};

List.prototype["fantasy-land/filter"] = function<A>(
  predicate: (a: A) => boolean
): List<A> {
  return filter(predicate, this);
};

List.prototype["fantasy-land/empty"] = function(): List<any> {
  return empty();
};

List.prototype["fantasy-land/concat"] = function<A>(right: List<A>): List<A> {
  return concat(this, right);
};

List.prototype["fantasy-land/reduce"] = function<A, B>(
  f: (acc: B, value: A) => B,
  initial: B
): B {
  return foldl(f, initial, this);
};
