import * as L from "./index";
import { List } from "./index";

// All functions of arity 1 are simply re-exported as they don't require currying
export {
  Node,
  List,
  list,
  isList,
  length,
  of,
  empty,
  first,
  last,
  flatten,
  pop,
  init,
  tail,
  from,
  toArray,
  reverse,
  backwards,
  sort,
  group,
  dropRepeats,
  isEmpty
} from "./index";

export interface Curried2<A, B, R> {
  (a: A): (b: B) => R;
  (a: A, b: B): R;
}

export interface Curried3<A, B, C, R> {
  (a: A, b: B, c: C): R;
  (a: A, b: B): (c: C) => R;
  (a: A): Curried2<B, C, R>;
}

function curry2(f: Function): any {
  return function curried(a: any, b: any): any {
    return arguments.length === 2 ? f(a, b) : (b: any) => f(a, b);
  };
}

function curry3(f: (a: any, b: any, c: any) => any): any {
  return function curried(a: any, b: any, c: any): any {
    switch (arguments.length) {
      case 3:
        return f(a, b, c);
      case 2:
        return (c: any) => f(a, b, c);
      default:
        // Assume 1
        return curry2((b: any, c: any) => f(a, b, c));
    }
  };
}

function curry4(f: (a: any, b: any, c: any, d: any) => any): any {
  return function curried(a: any, b: any, c: any, d: any): any {
    switch (arguments.length) {
      case 4:
        return f(a, b, c, d);
      case 3:
        return (d: any) => f(a, b, c, d);
      case 2:
        return curry2((c: any, d: any) => f(a, b, c, d));
      default:
        // Assume 1
        return curry3((b, c, d) => f(a, b, c, d));
    }
  };
}

// Arity 2

export const prepend: typeof L.prepend &
  (<A>(value: A) => (l: List<A>) => List<A>) = curry2(L.prepend);

export const append: typeof prepend = curry2(L.append);

export const pair: typeof L.pair &
  (<A>(first: A) => (second: A) => List<A>) = curry2(L.pair);

export const repeat: typeof L.repeat &
  (<A>(value: A) => (times: number) => List<A>) = curry2(L.repeat);

export const times: typeof L.times &
  (<A>(func: (index: number) => A) => (times: number) => List<A>) = curry2(
  L.times
);

export const nth: typeof L.nth &
  ((index: number) => <A>(l: List<A>) => A | undefined) = curry2(L.nth);

export const map: typeof L.map &
  (<A, B>(f: (a: A) => B) => (l: List<A>) => List<B>) = curry2(L.map);

export const forEach: typeof L.forEach &
  (<A>(callback: (a: A) => void) => (l: List<A>) => void) = curry2(L.forEach);

export const pluck: typeof L.pluck &
  (<K extends string>(
    key: K
  ) => <C, B extends K & (keyof C)>(l: List<C>) => List<C[B]>) = curry2(
  L.pluck
);

export const intersperse: typeof prepend = curry2(L.intersperse);

export const range: typeof L.range &
  ((start: number) => (end: number) => List<number>) = curry2(L.range);

export const filter: typeof L.filter &
  (<A, B extends A>(predicate: (a: A) => a is B) => (l: List<A>) => List<B>) &
  (<A>(predicate: (a: A) => boolean) => (l: List<A>) => List<A>) = curry2(
  L.filter
);

export const reject: typeof filter = curry2(L.reject);

export const partition: typeof L.partition &
  (<A>(
    predicate: (a: A) => boolean
  ) => (l: List<A>) => [List<A>, List<A>]) = curry2(L.partition);

export const join: typeof L.join &
  ((seperator: string) => (l: List<string>) => List<string>) = curry2(L.join);

export const ap: typeof L.ap &
  (<A, B>(listF: List<(a: A) => B>) => (l: List<A>) => List<B>) = curry2(L.ap);

export const flatMap: typeof L.flatMap &
  (<A, B>(f: (a: A) => List<B>) => (l: List<A>) => List<B>) = curry2(L.flatMap);

export const chain = flatMap;

export const every: typeof L.every &
  (<A>(predicate: (a: A) => boolean) => (l: List<A>) => boolean) = curry2(
  L.every
);

export const all: typeof every = curry2(L.all);

export const some: typeof every = curry2(L.some);

export const any: typeof every = curry2(L.any);

export const none: typeof every = curry2(L.none);

export const find: typeof L.find &
  (<A>(predicate: (a: A) => boolean) => (l: List<A>) => A | undefined) = curry2(
  L.find
);

export const findLast: typeof find = curry2(L.findLast);

export const indexOf: typeof L.indexOf &
  (<A>(element: A) => (l: List<A>) => number) = curry2(L.indexOf);

export const lastIndexOf: typeof indexOf = curry2(L.lastIndexOf);

export const findIndex: typeof L.findIndex &
  (<A>(predicate: (a: A) => boolean) => (l: List<A>) => number) = curry2(
  L.findIndex
);

export const includes: typeof L.includes &
  (<A>(element: A) => (l: List<A>) => number) = curry2(L.includes);

export const contains = includes;

export const equals: typeof L.equals &
  (<A>(first: List<A>) => (second: List<A>) => boolean) = curry2(L.equals);

export const concat: typeof L.concat &
  (<A>(left: List<A>) => (right: List<A>) => List<A>) = curry2(L.concat);

export const take: typeof L.take &
  ((n: number) => <A>(l: List<A>) => List<A>) = curry2(L.take);

export const takeLast: typeof take = curry2(L.takeLast);

export const drop: typeof take = curry2(L.drop);

export const dropRepeatsWith: typeof L.dropRepeatsWith &
  (<A>(f: (a: A, b: A) => boolean) => (l: List<A>) => List<A>) = curry2(
  L.groupWith
);

export const dropLast: typeof take = curry2(L.dropLast);

export const takeWhile: typeof filter = curry2(L.takeWhile);

export const takeLastWhile: typeof filter = curry2(L.takeLastWhile);

export const dropWhile: typeof filter = curry2(L.dropWhile);

export const splitAt: typeof L.splitAt &
  ((index: number) => <A>(l: List<A>) => [List<A>, List<A>]) = curry2(
  L.splitAt
);

export const splitWhen: typeof L.splitWhen &
  (<A>(
    predicate: (a: A) => boolean
  ) => (l: List<A>) => [List<A>, List<A>]) = curry2(L.splitWhen);

export const splitEvery: typeof L.splitEvery &
  (<A>(size: number) => (l: List<A>) => List<List<A>>) = curry2(L.splitEvery);

export const sortBy: typeof L.sortBy &
  (<A, B extends L.Comparable>(
    f: (a: A) => B
  ) => (l: List<A>) => List<A>) = curry2(L.sortBy);

export const sortWith: typeof L.sortWith &
  (<A>(
    comparator: (a: A, b: A) => L.Ordering
  ) => (l: List<A>) => List<A>) = curry2(L.sortWith);

export const groupWith: typeof L.groupWith &
  (<A>(f: (a: A, b: A) => boolean) => (l: List<A>) => List<List<A>>) = curry2(
  L.groupWith
);

export const zip: typeof L.zip &
  (<A>(as: List<A>) => <B>(bs: List<B>) => List<[A, B]>) = curry2(L.zip);

export const sequence: typeof L.sequence &
  ((ofObj: L.Of) => <A>(l: List<L.Applicative<A>>) => any) = curry2(L.sequence);

// Arity 3

export const foldl: typeof L.foldl & {
  <A, B>(f: (acc: B, value: A) => B): Curried2<B, List<A>, B>;
  <A, B>(f: (acc: B, value: A) => B, initial: B): (l: List<A>) => B;
} = curry3(L.foldl);

export const reduce: typeof foldl = foldl;

export const scan: typeof L.scan & {
  <A, B>(f: (acc: B, value: A) => B): Curried2<B, List<A>, List<B>>;
  <A, B>(f: (acc: B, value: A) => B, initial: B): (l: List<A>) => List<B>;
} = curry3(L.scan);

export const foldr: typeof L.foldl & {
  <A, B>(f: (value: A, acc: B) => B): Curried2<B, List<A>, B>;
  <A, B>(f: (value: A, acc: B) => B, initial: B): (l: List<A>) => B;
} = curry3(L.foldr);

export const traverse: typeof L.traverse & {
  (of: L.Of): (<A, B>(f: (a: A) => L.Applicative<B>) => (l: List<B>) => any) &
    (<A, B>(f: (a: A) => L.Applicative<B>, l: List<B>) => any);
  <A, B>(of: L.Of, f: (a: A) => L.Applicative<B>): (l: List<B>) => any;
} = curry3(L.traverse);

export const equalsWith: typeof L.equalsWith & {
  <A>(f: (a: A, b: A) => boolean): Curried2<List<A>, List<A>, boolean>;
  <A>(f: (a: A, b: A) => boolean, l1: List<A>): (l2: List<A>) => boolean;
} = curry3(L.equalsWith);

export const reduceRight: typeof foldr = foldr;

export const update: typeof L.update & {
  <A>(index: number, a: A): (l: List<A>) => List<A>;
  <A>(index: number): ((a: A, l: List<A>) => List<A>) &
    ((a: A) => (l: List<A>) => List<A>);
} = curry3(L.update);

export const adjust: typeof L.adjust & {
  <A>(index: number, f: (value: A) => A): (l: List<A>) => List<A>;
  (index: number): <A>(
    f: (value: A) => A,
    l: List<A>
  ) => List<A> & (<A>(f: (value: A) => A) => (l: List<A>) => List<A>);
} = curry3(L.adjust);

export const slice: typeof L.slice & {
  (from: number): (<A>(to: number) => (l: List<A>) => List<A>) &
    (<A>(to: number, l: List<A>) => List<A>);
  (from: number, to: number): <A>(l: List<A>) => List<A>;
} = curry3(L.slice);

export const remove: typeof slice = curry3(L.remove);

export const insert: typeof update = curry3(L.insert);

export const insertAll: typeof L.insertAll & {
  <A>(index: number, elements: List<A>): (l: List<A>) => List<A>;
  <A>(index: number): ((elements: List<A>, l: List<A>) => List<A>) &
    ((elements: List<A>) => (l: List<A>) => List<A>);
} = curry3(L.insertAll);

export const zipWith: typeof L.zipWith & {
  <A, B, C>(f: (a: A, b: B) => C, as: List<A>): (bs: List<B>) => List<C>;
  <A, B, C>(f: (a: A, b: B) => C): Curried2<List<A>, List<B>, List<C>>;
} = curry3(L.zipWith);

// Arity 4

export const foldlWhile: typeof L.foldlWhile & {
  // Three arguments
  <A, B>(
    predicate: (acc: B, value: A) => boolean,
    f: (acc: B, value: A) => B,
    initial: B
  ): (l: List<A>) => B;
  // Two arguments
  <A, B>(
    predicate: (acc: B, value: A) => boolean,
    f: (acc: B, value: A) => B
  ): Curried2<B, List<A>, B>;
  // One argument
  <A, B>(predicate: (acc: B, value: A) => boolean): Curried3<
    (acc: B, value: A) => B,
    B,
    List<A>,
    B
  >;
} = curry4(L.foldlWhile);

export const reduceWhile: typeof foldlWhile = foldlWhile;
