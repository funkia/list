import { List, Comparable, Ordering, Applicative, Of } from "./fantasy-land";
import * as L from "./fantasy-land";

export * from "./index";

declare module "./index" {
  interface List<A> {
    empty(): List<any>;
    of<B>(b: B): List<B>;
    append(value: A): List<A>;
    nth(index: number): A | undefined;
    prepend(value: A): List<A>;
    append(value: A): List<A>;
    intersperse(separator: A): List<A>;
    first(): A | undefined;
    last(): A | undefined;
    map<B>(f: (a: A) => B): List<B>;
    pluck<K extends keyof A>(key: K): List<A[K]>;
    foldl<B>(f: (acc: B, value: A) => B, initial: B): B;
    reduce<B>(f: (acc: B, value: A) => B, initial: B): B;
    scan<B>(f: (acc: B, value: A) => B, initial: B): List<B>;
    foldr<B>(f: (value: A, acc: B) => B, initial: B): B;
    reduceRight<B>(f: (value: A, acc: B) => B, initial: B): B;
    traverse<A, B>(of: Of, f: (a: A) => Applicative<B>): any;
    sequence<A, B>(this: List<Applicative<A>>, of: Of): any;
    forEach(callback: (a: A) => void): void;
    filter(predicate: (a: A) => boolean): List<A>;
    filter<B extends A>(predicate: (a: A) => a is B): List<B>;
    reject(predicate: (a: A) => boolean): List<A>;
    partition(predicate: (a: A) => boolean): [List<A>, List<A>];
    join(separator: string): string;
    ap<B>(listF: List<(a: A) => B>): List<B>;
    flatten(this: List<List<A>>): List<A>;
    flatMap<B>(f: (a: A) => List<B>): List<B>;
    chain<B>(f: (a: A) => List<B>): List<B>;
    every(predicate: (a: A) => boolean): boolean;
    some(predicate: (a: A) => boolean): boolean;
    none(predicate: (a: A) => boolean): boolean;
    indexOf(element: A): number;
    lastIndexOf(element: A): number;
    find(predicate: (a: A) => boolean): A | undefined;
    findLast(predicate: (a: A) => boolean): A | undefined;
    findIndex(predicate: (a: A) => boolean): number;
    includes(element: A): boolean;
    equals(secondList: List<any>): boolean;
    equalsWith(f: (a: A, b: A) => boolean, secondList: List<any>): boolean;
    concat(right: List<A>): List<A>;
    update(index: number, a: A): List<A>;
    adjust(index: number, f: (a: A) => A): List<A>;
    slice(from: number, to: number): List<A>;
    take(n: number): List<A>;
    takeWhile(predicate: (a: A) => boolean): List<A>;
    takeLastWhile(predicate: (a: A) => boolean): List<A>;
    takeLast(n: number): List<A>;
    splitAt(index: number): [List<A>, List<A>];
    splitWhen(predicate: (a: A) => boolean): [List<A>, List<A>];
    splitEvery(size: number): List<List<A>>;
    remove(from: number, amount: number): List<A>;
    drop(n: number): List<A>;
    dropWhile(predicate: (a: A) => boolean): List<A>;
    dropRepeats(): List<A>;
    dropRepeatsWith(predicate: (a: A, b: A) => boolean): List<A>;
    dropLast(n: number): List<A>;
    pop(): List<A>;
    tail(): List<A>;
    toArray(): A[];
    insert(index: number, element: A): List<A>;
    insertAll(index: number, elements: List<A>): List<A>;
    reverse(): List<A>;
    zipWith<B, C>(f: (a: A, b: B) => C, bs: List<B>): List<C>;
    zip<B>(bs: List<B>): List<[A, B]>;
    sort<A extends Comparable>(this: List<A>, l: List<A>): List<A>;
    sortBy<B extends Comparable>(f: (a: A) => B): List<A>;
    sortWith(comparator: (a: A, b: A) => Ordering): List<A>;
    group(): List<List<A>>;
    groupWith<A>(f: (a: A, b: A) => boolean): List<List<A>>;
    isEmpty(): boolean;
  }
}

List.prototype.append = function<A>(value: A): List<A> {
  return L.append(value, this);
};

List.prototype.intersperse = function<A>(separator: A): List<A> {
  return L.intersperse(separator, this);
};

List.prototype.nth = function<A>(index: number): A | undefined {
  return L.nth(index, this);
};

List.prototype.empty = function(): List<any> {
  return L.empty();
};

List.prototype.of = function<B>(b: B): List<B> {
  return L.of(b);
};

List.prototype.prepend = function<A>(value: A): List<A> {
  return L.prepend(value, this);
};

List.prototype.append = function<A>(value: A): List<A> {
  return L.append(value, this);
};

List.prototype.first = function<A>(): A | undefined {
  return L.first(this);
};

List.prototype.last = function<A>(): A | undefined {
  return L.last(this);
};

List.prototype.map = function<A, B>(f: (a: A) => B): List<B> {
  return L.map(f, this);
};

List.prototype.pluck = function<A, K extends keyof A>(
  this: List<A>,
  key: K
): List<A[K]> {
  return L.pluck(key, this);
} as any;

List.prototype.foldl = function foldl<A, B>(
  f: (acc: B, value: A) => B,
  initial: B
): B {
  return L.foldl(f, initial, this);
};

List.prototype.reduce = List.prototype.foldl;

List.prototype.scan = function scan<A, B>(
  f: (acc: B, value: A) => B,
  initial: B
): List<B> {
  return L.scan(f, initial, this);
};

List.prototype.foldr = function<A, B>(
  f: (value: A, acc: B) => B,
  initial: B
): B {
  return L.foldr(f, initial, this);
};

List.prototype.reduceRight = List.prototype.foldr;

List.prototype.traverse = function<A, B>(
  of: Of,
  f: (a: A) => Applicative<B>
): any {
  return L.traverse(of, f, this);
};

List.prototype.sequence = function<A>(this: List<Applicative<A>>, of: Of): any {
  return L.sequence(of, this);
};

List.prototype.forEach = function<A>(callback: (a: A) => void): void {
  return L.forEach(callback, this);
};

List.prototype.filter = function<A>(predicate: (a: A) => boolean): List<A> {
  return L.filter(predicate, this);
};

List.prototype.reject = function<A>(predicate: (a: A) => boolean): List<A> {
  return L.reject(predicate, this);
};

List.prototype.partition = function<A>(
  predicate: (a: A) => boolean
): [List<A>, List<A>] {
  return L.partition(predicate, this);
};

List.prototype.join = function(separator: string): string {
  return L.join(separator, this);
};

List.prototype.ap = function<A, B>(listF: List<(a: A) => B>): List<B> {
  return L.ap(listF, this);
};

List.prototype.flatten = function<A>(this: List<List<A>>): List<A> {
  return L.flatten(this);
};

List.prototype.flatMap = function<A, B>(f: (a: A) => List<B>): List<B> {
  return L.flatMap(f, this);
};

List.prototype.chain = List.prototype.flatMap;

List.prototype.every = function<A>(predicate: (a: A) => boolean): boolean {
  return L.every(predicate, this);
};

List.prototype.some = function<A>(predicate: (a: A) => boolean): boolean {
  return L.some(predicate, this);
};

List.prototype.none = function<A>(predicate: (a: A) => boolean): boolean {
  return L.none(predicate, this);
};

List.prototype.indexOf = function<A>(element: A): number {
  return L.indexOf(element, this);
};

List.prototype.lastIndexOf = function<A>(element: A): number {
  return L.lastIndexOf(element, this);
};

List.prototype.find = function find<A>(
  predicate: (a: A) => boolean
): A | undefined {
  return L.find(predicate, this);
};

List.prototype.findLast = function findLast<A>(
  predicate: (a: A) => boolean
): A | undefined {
  return L.findLast(predicate, this);
};

List.prototype.findIndex = function<A>(predicate: (a: A) => boolean): number {
  return L.findIndex(predicate, this);
};

List.prototype.includes = function<A>(element: A): boolean {
  return L.includes(element, this);
};

List.prototype.equals = function<A>(secondList: List<A>): boolean {
  return L.equals(this, secondList);
};

List.prototype.equalsWith = function<A>(
  f: (a: A, b: A) => boolean,
  secondList: List<A>
): boolean {
  return L.equalsWith(f, this, secondList);
};

List.prototype.concat = function<A>(right: List<A>): List<A> {
  return L.concat(this, right);
};
List.prototype.update = function<A>(index: number, a: A): List<A> {
  return L.update(index, a, this);
};
List.prototype.adjust = function<A>(index: number, f: (a: A) => A): List<A> {
  return L.adjust(index, f, this);
};
List.prototype.slice = function<A>(from: number, to: number): List<A> {
  return L.slice(from, to, this);
};

List.prototype.take = function<A>(n: number): List<A> {
  return L.take(n, this);
};

List.prototype.takeWhile = function<A>(predicate: (a: A) => boolean): List<A> {
  return L.takeWhile(predicate, this);
};

List.prototype.takeLast = function<A>(n: number): List<A> {
  return L.takeLast(n, this);
};

List.prototype.takeLastWhile = function<A>(
  predicate: (a: A) => boolean
): List<A> {
  return L.takeLastWhile(predicate, this);
};

List.prototype.splitAt = function<A>(index: number): [List<A>, List<A>] {
  return L.splitAt(index, this);
};

List.prototype.splitWhen = function<A>(
  predicate: (a: A) => boolean
): [List<A>, List<A>] {
  return L.splitWhen(predicate, this);
};

List.prototype.splitEvery = function<A>(size: number): List<List<A>> {
  return L.splitEvery(size, this);
};

List.prototype.remove = function<A>(from: number, amount: number): List<A> {
  return L.remove(from, amount, this);
};

List.prototype.drop = function<A>(n: number): List<A> {
  return L.drop(n, this);
};

List.prototype.dropWhile = function<A>(predicate: (a: A) => boolean): List<A> {
  return L.dropWhile(predicate, this);
};

List.prototype.dropRepeats = function<A>(): List<A> {
  return L.dropRepeats(this);
};

List.prototype.dropRepeatsWith = function<A>(
  predicate: (a: A, b: A) => boolean
): List<A> {
  return L.dropRepeatsWith(predicate, this);
};

List.prototype.dropLast = function<A>(n: number): List<A> {
  return L.dropLast(n, this);
};
List.prototype.pop = function<A>(): List<A> {
  return L.pop(this);
};

List.prototype.tail = function<A>(): List<A> {
  return L.tail(this);
};

List.prototype.toArray = function<A>(): A[] {
  return L.toArray(this);
};

List.prototype.insert = function<A>(index: number, element: A): List<A> {
  return L.insert(index, element, this);
};

List.prototype.insertAll = function<A>(
  index: number,
  elements: List<A>
): List<A> {
  return L.insertAll(index, elements, this);
};

List.prototype.reverse = function<A>(): List<A> {
  return L.reverse(this);
};

List.prototype.zipWith = function<A, B, C>(
  f: (a: A, b: B) => C,
  bs: List<B>
): List<C> {
  return L.zipWith(f, this, bs);
};
List.prototype.zip = function<A, B>(bs: List<B>): List<[A, B]> {
  return L.zip(this, bs);
};

List.prototype.sort = function<A extends Comparable>(): List<A> {
  return L.sort(this);
};

List.prototype.sortWith = function<A>(
  comparator: (a: A, b: A) => Ordering
): List<A> {
  return L.sortWith(comparator, this);
};

List.prototype.sortBy = function<A, B extends Comparable>(
  f: (a: A) => B
): List<A> {
  return L.sortBy(f, this);
};

List.prototype.group = function<A>(): List<List<A>> {
  return L.group(this);
};

List.prototype.groupWith = function<A>(
  f: (a: A, b: A) => boolean
): List<List<A>> {
  return L.groupWith(f, this);
};

List.prototype.isEmpty = function(): boolean {
  return L.isEmpty(this);
};
