import * as L from "./index";
import { List } from "./index";

// All functions of arity 1 are simply re-exported as they don't require currying
export {
  Node,
  List,
  list,
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

function curry2(f: (a: any, b: any) => any): any {
  return function curried(a: any, b: any): any {
    return arguments.length === 2 ? f(a, b) : (b: any) => f(a, b);
  } as any;
}

function curry3(f: (a: any, b: any, c: any) => any): any {
  return function curried(a: any, b: any, c: any): any {
    switch (arguments.length) {
      case 3:
        return f(a, b, c);
      case 2:
        return curry2((b: any, c: any) => f(a, b, c));
      default:
        // Assume 1
        return (c: any) => f(a, b, c);
    }
  };
}

// Arity 2
export const prepend: typeof L.prepend &
  (<A>(value: A) => (l: List<A>) => List<A>) = curry2(L.prepend);
export const append: typeof L.append &
  (<A>(value: A) => (l: List<A>) => List<A>) = curry2(L.append);
export const pair: typeof L.pair &
  (<A>(first: A) => (second: A) => List<A>) = curry2(L.pair);
export const repeat: typeof L.repeat = curry2(L.repeat);
export const times: typeof L.times = curry2(L.times);
export const nth: typeof L.nth = curry2(L.nth);

export const map: typeof L.map &
  (<A, B>(f: (a: A) => B) => (l: List<A>) => List<B>) = curry2(L.map);

export const forEach: typeof L.forEach = curry2(L.forEach);
export const pluck: typeof L.pluck = curry2(L.pluck as (<A>(
  key: string,
  l: L.List<A>
) => A));
export const range: typeof L.range = curry2(L.range);
export const filter: typeof L.filter = curry2(L.filter);
export const reject: typeof L.reject = curry2(L.reject);
export const partition: typeof L.partition = curry2(L.partition);
export const join: typeof L.join = curry2(L.join);
export const ap: typeof L.ap = curry2(L.ap);
export const chain: typeof L.chain = curry2(L.chain);
export const every: typeof L.every = curry2(L.every);
export const all: typeof L.all = every;
export const some: typeof L.some = curry2(L.some);
export const any: typeof L.any = some;
export const none: typeof L.none = curry2(L.none);
export const find: typeof L.find = curry2(L.find);
export const indexOf: typeof L.indexOf = curry2(L.indexOf);
export const findIndex: typeof L.findIndex = curry2(L.findIndex);
export const includes: typeof L.includes = curry2(L.includes);
export const contains: typeof L.contains = includes;
export const equals: typeof L.equals = curry2(L.equals);
export const concat: typeof L.concat = curry2(L.concat);
export const take: typeof L.take = curry2(L.take);
export const takeWhile: typeof L.takeWhile = curry2(L.takeWhile);
export const dropWhile: typeof L.dropWhile = curry2(L.dropWhile);
export const takeLast: typeof L.takeLast = curry2(L.takeLast);
export const splitAt: typeof L.splitAt = curry2(L.splitAt);
export const drop: typeof L.drop = curry2(L.drop);
export const dropLast: typeof L.dropLast = curry2(L.dropLast);

// Arity 3
export const foldl = curry3(L.foldl);
export const reduce = foldl;
export const foldr = curry3(L.foldr);
export const reduceRight = foldr;
export const update = curry3(L.update);
export const adjust = curry3(L.adjust);
export const slice = curry3(L.slice);
export const remove = curry3(L.remove);
export const insert = curry3(L.insert);
export const insertAll = curry3(L.insertAll);
