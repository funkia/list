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
  fromArray,
  toArray,
  reverse,
  fromIterable
} from "./index";

export interface Curried2<A, B, R> {
  (t1: A): (t2: B) => R;
  (t1: A, t2: B): R;
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

export const range: typeof L.range &
  ((start: number) => (end: number) => List<number>) = curry2(L.range);

export const filter: typeof L.filter &
  (<A>(predicate: (a: A) => boolean) => (l: List<A>) => List<A>) = curry2(
  L.filter
);

export const reject: typeof filter = curry2(L.reject);

export const partition: typeof L.partition &
  (<A>(predicate: (a: A) => boolean) => (l: List<A>) => List<List<A>>) = curry2(
  L.partition
);

export const join: typeof L.join &
  ((seperator: string) => (l: List<string>) => List<string>) = curry2(L.join);

export const ap: typeof L.ap &
  (<A, B>(listF: List<(a: A) => B>) => (l: List<A>) => List<B>) = curry2(L.ap);

export const chain: typeof L.chain &
  (<A, B>(f: (a: A) => List<B>) => (l: List<A>) => List<B>) = curry2(L.chain);

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

export const indexOf: typeof L.indexOf &
  (<A>(element: A) => (l: List<A>) => number) = curry2(L.indexOf);

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

export const dropLast: typeof take = curry2(L.dropLast);

export const takeWhile: typeof filter = curry2(L.takeWhile);

export const dropWhile: typeof filter = curry2(L.dropWhile);

export const splitAt: typeof L.splitAt &
  ((index: number) => <A>(l: List<A>) => [List<A>, List<A>]) = curry2(
  L.splitAt
);

export const zip: typeof L.zip &
  (<A>(as: List<A>) => <B>(bs: List<B>) => List<[A, B]>) = curry2(L.zip);

// Arity 3

export const foldl: typeof L.foldl & {
  <A, B>(f: (acc: B, value: A) => B): Curried2<B, List<A>, B>;
  <A, B>(f: (acc: B, value: A) => B, initial: B): (l: List<A>) => B;
} = curry3(L.foldl);

export const reduce: typeof foldl = foldl;

export const foldr: typeof L.foldl & {
  <A, B>(f: (value: A, acc: B) => B): Curried2<B, List<A>, B>;
  <A, B>(f: (value: A, acc: B) => B, initial: B): (l: List<A>) => B;
} = curry3(L.foldr);

export const reduceRight: typeof foldr = foldr;

export const update: typeof L.update & {
  <A>(index: number, a: A): (l: List<A>) => List<A>;
  <A>(index: number): ((a: A, l: List<A>) => List<A>) &
    ((a: A) => (l: List<A>) => List<A>);
} = curry3(L.update);

export const adjust: typeof L.adjust & {
  <A>(f: (value: A) => A, index: number): (l: List<A>) => List<A>;
  <A>(f: (value: A) => A): Curried2<number, List<A>, List<A>>;
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
