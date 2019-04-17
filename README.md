<h3 align="center">
  <img align="center" src="assets/listopard.png" alt="List logo" width=400 />
</h3>

<p align="center">
A fast immutable list with a functional API.
</p>

<p align="center">
  <a href="https://gitter.im/funkia/General"><img src="https://img.shields.io/gitter/room/funkia/General.svg" alt="Gitter" height="20"></a>
  <a href="https://travis-ci.org/funkia/list"><img src="https://travis-ci.org/funkia/list.svg?branch=master" alt="Build Status" height="20"></a>
  <a href="https://codecov.io/gh/funkia/list"><img src="https://codecov.io/gh/funkia/list/branch/master/graph/badge.svg" alt="codecov" height="20"></a>
</p>

# List

List is a purely functional alternative to arrays. It is an
implementation of a fast persistent sequence data structure. Compared
to JavaScript's `Array` List has three major benefits.

* **Safety**. List is immutable. This makes it safer and better suited
  for functional programming. It doesn't tempt you with an imperative API and
  accidental mutations won't be a source of bugs.
* **Performance**. Since List doesn't allow mutations it can be
  heavily optimized for pure operations. This makes List much faster for
  functional programming than arrays. [See the
  benchmarks](https://funkia.github.io/list/benchmarks/).
* **API**: List has a large API of useful functions and offers both chainable
  methods and curried functions to suit every taste.

## Features

* **Familiar functional API**. List follows the naming conventions
  common in functional programming and has arguments ordered for
  currying/partial application.
* **Extensive API**. List has all the functions known from `Array`
  and a lot of additional functions that'll save the day once you need them.
* **Extremely fast**. List is a carefully optimized implementation of
  the highly efficient data-structure _relaxed radix balanced trees_. We have
  an [extensive benchmark suite](https://funkia.github.io/list/benchmarks/) to
  ensure optimal performance. Here is an explanation [how](http://vindum.io/blog/how-can-list-be-faster-than-native-arrays/)
* **Several API styles**. In addition to the base API List offers [additional
  API styles](#api-styles). Import `list/methods` to get chainable methods or
  alterntively import `list/curried` to get a version of the API where every
  function is curried. Both variants are 100% TypeScript compatible.
* **Does one thing well**. Instead of offering a wealth of data
  structures List has a tight focus on being the best immutable list possible.
  It doesn't do everything but is designed to work well with the libraries
  you're already using.
* **Seamless Ramda integration**. If you know Ramda you already know
  how to use List. List was designed to integrate [seamlessly with
  Ramda](#seamless-ramda-integration).
* **Type safe**. List is implemented in TypeScript. It makes full use of
  TypeScript features to provide accurate types that covers the entire library.
* **Fully compatible with tree-shaking**. List ships with tree-shaking
  compatible ECMAScript modules. `import * as L from "list"` in itself adds
  zero bytes to your bundle when using Webpack. Using a function adds only that
  function and the very small (<1KB) core of the library. You only pay in size
  for the functions that you actually use.
* **Iterable**. Implements the JavaScript iterable protocol. This
  means that lists can be use in `for..of` loops, works with destructuring, and
  can be passed to any function expecting an iterable. [See more](#iterable).
* **Fantasy Land support**. List
  [implements](#fantasy-land--static-land) both the Fantasy Land and the Static
  Land specification.

| Package | Version                                                                                 | Downloads                                                                                  | Dependencies                                                                                          | Dev Deps                                                                                                              | Install size                                                                                             | GZIP size                                                                                                                                                 |
| ------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list`  | [![npm version](https://badge.fury.io/js/list.svg)](https://www.npmjs.com/package/list) | [![Downloads](https://img.shields.io/npm/dt/list.svg)](https://www.npmjs.com/package/list) | [![Dependency Status](https://david-dm.org/funkia/list/status.svg)](https://david-dm.org/funkia/list) | [![devDependency Status](https://david-dm.org/funkia/list/dev-status.svg)](https://david-dm.org/funkia/list?type=dev) | [![install size](https://packagephobia.now.sh/badge?p=list)](https://packagephobia.now.sh/result?p=list) | [![gzip size](http://img.badgesize.io/https://cdn.jsdelivr.net/npm/list/dist/index.js?compression=gzip)](https://cdn.jsdelivr.net/npm/list/dist/index.js) |


## Getting started

This section explains how to get started using List. First you'll have
to install the library.

```
npm i list
```

Then you can import it.

```js
// As an ES module
import * as L from "list";
// Or with require
const L = require("list");
```

Then you can begin using List instead of arrays and enjoy immutability
the performance benefits.

As a replacement for array literals List offers the function `list`
for constructing lists. Instead of using `[...]` to construct an array
with the content `...` one can use `list(...)` to construct a list
with the same content. Here is an example.


```js
// An array literal
const myArray = [0, 1, 2, 3];
// The List equivalent
const myList = L.list(0, 1, 2, 3);
```

List has all the common functions that you know from native arrays and
other libraries.

```js
const myList = L.list(0, 1, 2, 3, 4, 5);
myList.length; //=> 6
L.filter(isEven, myList); //=> list(0, 2, 4)
L.map(n => n * n, myList); //=> list(0, 1, 4, 9, 16, 25)
L.reduce((sum, n) => sum + n, 0, myList); //=> 15
L.slice(2, 5, myList); //=> list(2, 3, 4)
L.concat(myList, L.list(6, 7, 8)); //=> list(0, 1, 2, 3, 4, 5, 6, 7, 8);
```

You'll probably also end up needing to convert between arrays and
List. You can do that with the functions `from` and `toArray`.

```js
L.toArray(L.list("foo", "bar")); //=> ["foo", "bar"];
L.from(["foo", "bar"]); //=> L.list("foo", "bar");
```

List offers a wealth of other useful and high-performing functions.
You can see them all in the [API documentation](#api-documentation)

## API styles

List offers several API styles. By default the library exports "plain"
functions. Additionally curried functions can be imported from `list/curried`
and an API with chainable methods can be imported from `list/methods`. The
differences are illustrated below.

The default export offers normal plain function.

```ts
import * as L from "list";

const l = take(5, sortBy(p => p.name, filter(p => p.age > 22, people)));
```

In `list/methods` all functions are available as chainable methods.

```ts
import * as L from "list/methods";

const l = people
  .filter(p => p.age > 22)
  .sortBy(p => p.name)
  .take(5);
```

In `list/curried` all functions are curried. In the example below the partially
applied functions are composed together using Ramda's
[`pipe`](http://ramdajs.com/docs/#pipe). Alternatively one could have used
Lodash's [`flowRight`](https://lodash.com/docs/#flow).

```ts
import * as R from "ramda";
import * as L from "list/curried";

const l = R.pipe(L.filter(p => p.age > 22), L.sortBy(p => p.name), L.take(5))(
  people
);
```

## Iterable

List implements the JavaScript iterable protocol. This means that
lists can be used with array destructuring just like normal arrays.

```js
const myList = L.list("first", "second", "third", "fourth");
const [first, second] = myList;
first; //=> "first"
second; //=> "second"
```

Lists can also be used in `for..of` loops.

```js
for (const element of myList) {
  console.log(element);
}
// logs: first, second, third, fourth
```

And they can be passed to any function that takes an iterable as its argument.
As an example a list can be converted into a native
[`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

```js
const mySet = new Set(myList);
mySet.has("third"); //=> true
```

This works because the `Set` constructor accepts any iterable as
argument.

Lists also work with [spread
syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).
For instance, you can call a function like this.

```js
console.log(...list("hello", "there", "i'm", "logging", "elements"));
```

Then each element of the list will be passed as an argument to `console.log`.

List also suports iterating backwards over lists through the
[`backwards`](#backwards) function.

### Iterator anti-patterns

The iterable protocol allows for some very convenient patterns and
means that lists can integrate nicely with JavaScript syntax. But,
here are two anti-patterns that you should be aware of.

1.  Don't overuse `for..of` loops. Functions like [`map`](#map) and
    [`foldl`](#foldl) are often a better choice. If you want to perform
    a side-effect for each element in a list you should probably use
    [`forEach`](#forEach).
2.  Don't use the spread syntax in destructuring
    ```js
    const [a, b, ...cs] = myList; // Don't do this
    ```
    The syntax converts the rest of the iterable (in this case a list)
    into an array by iterating through the entire iterable. This is
    slow and it turns our list into an array. This alternative avoids
    both problems.
    ```js
    const [[a, b], cs] = splitAt(2, myList); // Do this
    ```
    This uses the [`splitAt`](#splitAt) function which splits and
    creates the list `cs` very efficiently in `O(log(n))` time.

## Seamless Ramda integration

List is designed to work seamlessly together with Ramda. Ramda offers a large
number of useful functions for working with arrays. List implements the same
functions on its immutable data structure. This means that Ramda users can keep
using the API they're familiar with. Additionally, List offers an entry point
where all functions are curried.

Since List implements Ramda's array API it is very easy to convert code from
using arrays to using immutable lists. As an example, consider the code below.

```js
import * as R from "ramda";

R.pipe(R.filter(n => n % 2 === 0), R.map(R.multiply(3)), R.reduce(R.add, 0))(
  array
);
```

The example can be converted to code using List as follows.

```js
import * as R from "ramda";
import * as L from "list/curried";

R.pipe(L.filter(n => n % 2 === 0), L.map(R.multiply(3)), L.reduce(R.add, 0))(
  list
);
```

For each function operating on arrays, the `R` is simply changed to an `L`.
This works because List exports functions that have the same names and behavior
as Ramdas functions.

### Implemented Ramda functions

The goal is to implement the entirety of Ramda's array functions for
List. The list below keeps track of how many of Ramda functions that
are missing and of how many that are already implemented. Currently 61
out of 76 functions have been implemented.

Implemented: `adjust`, `all`, `any`, `append`, `chain`, `concat`, `contains`,
`drop`, `dropLast`, `dropRepeats`, `dropRepeatsWith`, `dropWhile`, `filter`,
`find`, `findIndex`, `findLast`, `group`, `groupWith`, `head`, `flatten`,
`indexOf`, `intersperse`, `init`, `insert`, `insertAll`, `last`, `lastIndexOf`,
`length`, `join`, `map`, `none`, `nth`, `pair`, `partition`, `pluck`,
`prepend`, `range`, `reduce`, `reduceRight`, `reduceWhile`, `reject`, `remove`,
`reverse`, `repeat`, `scan`, `sequence`, `slice`, `sort`, `splitAt`,
`splitEvery`, `splitWhen`, `take`, `takeWhile`, `tail`,
`takeLast`,`takeLastWhile`, `traverse`, `times`, `update`, `zip`, `zipWith`.

Not implemented: `aperture`, `dropLastWhile`, `endsWith`, `findLastIndex`,
`indexBy`, `mapAccum`, `mapAccumRight`, `startsWith`, `transpose`, `unfold`,
`uniq`, `uniqBy`, `uniqWith`, `unnest` `without`, `xprod`.

### Differences compared to Ramda

While List tries to stay as close to Ramda's API as possible there are a few
deviations to be aware of.

* List's curried functions do not support the `R.__` placeholder. Instead of
  `R.reduce(R.__, 0, l)` one alternative is to use an arrow function `_ =>
  L.reduce(_, 0, l)` instead.
* [`sort`](#sort) and [`sortWith`](#sortwith) are different compared to what
  they do in Ramda. `L.sortWith` is equivalent to `R.sort` and `L.sort` sorts a
  list without taking a comparison function. This makes the common case of
  sorting a list of numbers or strings easier

## Fantasy Land & Static Land

<img align="right" width="82" height="82" alt="Fantasy Land" src="https://raw.github.com/fantasyland/fantasy-land/master/logo.png">
<img align="right" width="131" height="82" src="https://raw.githubusercontent.com/rpominov/static-land/master/logo/logo.png" />

List currently implements the following Fantasy Land and Static Land
specifications: Setoid, semigroup, monoid, foldable, functor, apply,
applicative, chain, monad.

The following specifications have not been implemented yet:
Traversable, Ord.

Since methods hinder tree-shaking the Fantasy Land methods are not
included by default. In order to get them you must import it likes
this:

```js
import "list/fantasy-land";
```

## API documentation

The API is organized into three parts.

1.  [Creating lists](#creating-lists) — Functions that _create_ lists.
2.  [Updating lists](#updating-lists) — Functions that _transform_ lists.
    That is, functions that take one or more lists as arguments and
    returns a new list.
3.  [Folds](#folds) — Functions that _extracts_ values based on lists.
    They take one or more lists as arguments and returns something that
    is not a list.

### Creating lists

### `list`

Creates a list based on the arguments given.

**Complexity**: `O(n)`

**Example**

```js
const l = list(1, 2, 3, 4); // creates a list of four elements
const l2 = list("foo"); // creates a singleton
```

### `empty`

Returns an empty list.

**Complexity**: `O(1)`

**Example**

```js
const emptyList = empty(); //=> list()
```

### `of`

Takes a single arguments and returns a singleton list that contains it.

**Complexity**: `O(1)`

**Example**

```js
of("foo"); //=> list("foo")
```

### `pair`

Takes two arguments and returns a list that contains them.

**Complexity**: `O(1)`

**Example**

```js
pair("foo", "bar"); //=> list("foo", "bar")
```

### `from`

Converts an array, an array-like or an itearble into a list.

**Complexity**: `O(n)`

**Example**

```js
from([0, 1, 2, 3, 4]); //=> list(0, 1, 2, 3, 4)
```

### `range`

Returns a list of numbers between an inclusive lower bound and an
exclusive upper bound.

**Complexity**: `O(n)`

**Example**

```js
range(3, 8); //=> list(3, 4, 5, 6, 7)
```

### `repeat`

Returns a list of a given length that contains the specified value in
all positions.

**Complexity**: `O(n)`

**Example**

```js
repeat(1, 7); //=> list(1, 1, 1, 1, 1, 1, 1)
repeat("foo", 3); //=> list("foo", "foo", "foo")
```

### `times`

Returns a list of given length that contains the value of the given function called with current index.

**Complexity**: `O(n)`

**Example**

```js
const twoFirsOdds = times(i => i * 2 + 1, 2);
const dots = times(() => {
  const x = Math.random() * width;
  const y = Math.random() * height;
  return { x, y };
}, 50);
```

### Updating lists

### `concat`

Concatenates two lists.

**Complexity**: `O(log(n))`

**Example**

```js
concat(list(0, 1, 2), list(3, 4)); //=> list(0, 1, 2, 3, 4)
```

### `flatten`

Flattens a list of lists into a list. Note that this function does
_not_ flatten recursively. It removes one level of nesting only.

**Complexity**: `O(n * log(m))` where `n` is the length of the outer
list and `m` the length of the inner lists.

**Example**

```js
const nested = list(list(0, 1, 2, 3), list(4), empty(), list(5, 6));
flatten(nested); //=> list(0, 1, 2, 3, 4, 5, 6)
```

### `prepend`

Prepends an element to the front of a list and returns the new list.

**Complexity**: `O(log(n))`, practically constant

**Example**

```js
const newList = prepend(0, list(1, 2, 3)); //=> list(0, 1, 2, 3)
```

### `append`

Appends an element to the end of a list and returns the new list.

**Complexity**: `O(log(n))`, practically constant

**Example**

```js
const newList = append(3, list(0, 1, 2)); //=> list(0, 1, 2, 3)
```

### `intersperse`

Inserts a separator between each element in a list.

**Example**

```js
intersperse("n", list("ba", "a", "a")); //=> list("ba", "n", "a", "n", "a")
```

### `map`

Applies a function to each element in the given list and returns a new
list of the values that the function return.

**Complexity**: `O(n)`

**Example**

```js
map(n => n * n, list(0, 1, 2, 3, 4)); //=> list(0, 1, 4, 9, 16)
```

### `pluck`

Extracts the specified property from each object in the list.

**Example**

```js
const l = list(
  { foo: 0, bar: "a" },
  { foo: 1, bar: "b" },
  { foo: 2, bar: "c" }
);
pluck("foo", l); //=> list(0, 1, 2)
```

### `update`

Returns a list that has the entry specified by the index replaced with
the given value.

If the index is out of bounds the given list is
returned unchanged.

**Complexity**: `O(log(n))`

**Example**

```js
update(2, "X", list("a", "b", "c", "d", "e")); //=> list("a", "b", "X", "d", "e")
```

### `adjust`

Returns a list that has the entry specified by the index replaced with
the value returned by applying the function to the value.

If the index is out of bounds the given list is
returned unchanged.

**Complexity**: `O(log(n))`

**Example**

```js
adjust(2, inc, list(0, 1, 2, 3, 4, 5)); //=> list(0, 1, 3, 3, 4, 5)
```

### `slice`

Returns a slice of a list. Elements are removed from the beginning and
end. Both the indices can be negative in which case they will count
from the right end of the list.

**Complexity**: `O(log(n))`

**Example**

```js
const l = list(0, 1, 2, 3, 4, 5);
slice(1, 4, l); //=> list(1, 2, 3)
slice(2, -2, l); //=> list(2, 3)
```

### `take`

Takes the first `n` elements from a list and returns them in a new list.

**Complexity**: `O(log(n))`

**Example**

```js
take(3, list(0, 1, 2, 3, 4, 5)); //=> list(0, 1, 2)
```

### `takeWhile`

Takes the first elements in the list for which the predicate returns
`true`.

**Complexity**: `O(k + log(n))` where `k` is the number of elements
satisfying the predicate.

**Example**

```js
takeWhile(n => n < 4, list(0, 1, 2, 3, 4, 5, 6)); //=> list(0, 1, 2, 3)
takeWhile(_ => false, list(0, 1, 2, 3, 4, 5)); //=> list()
```

### `takeLast`

Takes the last `n` elements from a list and returns them in a new
list.

**Complexity**: `O(log(n))`

**Example**

```js
takeLast(3, list(0, 1, 2, 3, 4, 5)); //=> list(3, 4, 5)
```

### `takeLastWhile`

Takes the last elements in the list for which the predicate returns
`true`.

**Complexity**: `O(k + log(n))` where `k` is the number of elements
satisfying the predicate.

**Example**

```js
takeLastWhile(n => n > 2, list(0, 1, 2, 3, 4, 5)); //=> list(3, 4, 5)
takeLastWhile(_ => false, list(0, 1, 2, 3, 4, 5)); //=> list()
```

### `splitAt`

Splits a list at the given index and return the two sides in a pair.
The left side will contain all elements before but not including the
element at the given index. The right side contains the element at the
index and all elements after it.

**Complexity**: `O(log(n))`

**Example**

```js
const l = list(0, 1, 2, 3, 4, 5, 6, 7, 8);
splitAt(4, l); //=> [list(0, 1, 2, 3), list(4, 5, 6, 7, 8)]
```

### `splitWhen`

Splits a list at the first element in the list for which the given
predicate returns `true`.

**Complexity**: `O(n)`

**Example**

```js
const l = list(0, 1, 2, 3, 4, 5, 6, 7);
splitWhen((n) => n > 3, l); //=> [list(0, 1, 2, 3), list(4, 5, 6, 7)]
```

### `remove`

Takes an index, a number of elements to remove and a list. Returns a
new list with the given amount of elements removed from the specified
index.

**Complexity**: `O(log(n))`

**Example**

```js
const l = list(0, 1, 2, 3, 4, 5, 6, 7, 8);
remove(4, 3, l); //=> list(0, 1, 2, 3, 7, 8)
remove(2, 5, l); //=> list(0, 1, 7, 8)
```

### `drop`

Returns a new list without the first `n` elements.

**Complexity**: `O(log(n))`

**Example**

```js
drop(2, list(0, 1, 2, 3, 4, 5)); //=> list(2, 3, 4, 5)
```

### `dropWhile`

Removes the first elements in the list for which the predicate returns
`true`.

**Complexity**: `O(k + log(n))` where `k` is the number of elements
satisfying the predicate.

**Example**

```js
dropWhile(n => n < 4, list(0, 1, 2, 3, 4, 5, 6)); //=> list(4, 5, 6)
```

### `dropLast`

Returns a new list without the last `n` elements.

**Complexity**: `O(log(n))`

**Example**

```js
dropLast(2, list(0, 1, 2, 3, 4, 5)); //=> list(0, 1, 2, 3)
```

### `dropRepeats`

Returns a new list without repeated elements.

**Complexity**: `O(n)`

**Example**

```js
dropRepeats(L.list(0, 0, 1, 1, 1, 2, 3, 3, 4, 4)); //=> list(0, 1, 2, 3, 4)
```

### `dropRepeatsWith`

Returns a new list without repeated elements by using the given
function to determine when elements are equal.

**Complexity**: `O(n)`

**Example**

```js
dropRepeatsWith(
  (n, m) => Math.floor(n) === Math.floor(m),
  list(0, 0.4, 1.2, 1.1, 1.8, 2.2, 3.8, 3.4, 4.7, 4.2)
); //=> list(0, 1, 2, 3, 4)
```

### `tail`

Returns a new list with the first element removed. If the list is
empty the empty list is returne.

**Complexity**: `O(1)`

**Example**

```js
tail(list(0, 1, 2, 3)); //=> list(1, 2, 3)
tail(empty()); //=> list()
```

### `pop`

Returns a new list with the last element removed. If the list is empty
the empty list is returned.

**Aliases**: `init`

**Complexity**: `O(1)`

**Example**

```js
pop(list(0, 1, 2, 3)); //=> list(0, 1, 2)
```

### `filter`

Returns a new list that only contains the elements of the original
list for which the predicate returns `true`.

**Complexity**: `O(n)`

**Example**

```js
filter(isEven, list(0, 1, 2, 3, 4, 5, 6)); //=> list(0, 2, 4, 6)
```

### `reject`

Returns a new list that only contains the elements of the original
list for which the predicate returns `false`.

**Complexity**: `O(n)`

**Example**

```js
reject(isEven, list(0, 1, 2, 3, 4, 5, 6)); //=> list(1, 3, 5)
```

### `reverse`

Reverses a list.

**Complexity**: `O(n)`

**Example**

```js
reverse(list(0, 1, 2, 3, 4, 5)); //=> list(5, 4, 3, 2, 1, 0)
```

### `ap`

Applies a list of functions to a list of values.

**Example**

```js
ap(list((n: number) => n + 2, n => 2 * n, n => n * n), list(1, 2, 3)); //=> list(3, 4, 5, 2, 4, 6, 1, 4, 9)
```

### `chain`

Maps a function over a list and concatenates all the resulting lists
together.

Also known as `flatMap`.

**Example**

```js
chain(n => list(n, 2 * n, n * n), list(1, 2, 3)); //=> list(1, 2, 1, 2, 4, 4, 3, 6, 9)
```

### `partition`

Splits the list into two lists. One list that contains all the values
for which the predicate returns `true` and one containing the values for
which it returns `false`.

**Complexity**: `O(n)`

**Example**

```js
partition(isEven, list(0, 1, 2, 3, 4, 5)); //=> list(list(0, 2, 4), list(1, 3, 5))
```

### `insert`

Inserts the given element at the given index in the list.

**Complexity**: `O(log(n))`

**Example**

```js
insert(2, "c", list("a", "b", "d", "e")); //=> list("a", "b", "c", "d", "e")
```

### `insertAll`

Inserts the given list of elements at the given index in the list.

**Complexity**: `O(log(n))`

**Example**

```js
insertAll(2, list("c", "d"), list("a", "b", "e", "f")); //=> list("a", "b", "c", "d", "e", "f")
```

### `zipWith`

This is like mapping over two lists at the same time. The two lists are
iterated over in parallel and each pair of elements is passed to the function.
The returned values are assembled into a new list.

The shortest list determine the size of the result.

**Complexity**: `O(log(n))` where `n` is the length of the smallest list.

**Example**

```js
const names = list("Turing", "Curry");
const years = list(1912, 1900);
zipWith((name, year) => ({ name, year }), names, years);
//=> list({ name: "Turing", year: 1912 }, { name: "Curry", year: 1900 });
```

### `zip`

Iterate over two lists in parallel and collect the pairs.

**Complexity**: `O(log(n))` where `n` is the length of the smallest list.

**Example**

```js
const names = list("a", "b", "c", "d", "e");
const years = list(0, 1, 2, 3, 4, 5, 6);
//=> list(["a", 0], ["b", 1], ["c", 2], ["d", 3], ["e", 4]);
```

### `sort`

Sorts the given list. The list should contain values that can be compared using
the `<` operator or values that implement the Fantasy Land
[Ord](https://github.com/fantasyland/fantasy-land#ord) specification.

Performs a stable sort.

**Complexity**: `O(n * log(n))`

**Example**

```js
sort(list(5, 3, 1, 8, 2)); //=> list(1, 2, 3, 5, 8)
sort(list("e", "a", "c", "b", "d"); //=> list("a", "b", "c", "d", "e")
```

### `sortBy`

Sort the given list by passing each value through the function and comparing
the resulting value. The function should either return values comparable using
`<` or values that implement the Fantasy Land
[Ord](https://github.com/fantasyland/fantasy-land#ord) specification.

Performs a stable sort.

**Complexity**: `O(n * log(n))`

**Example**

```js
sortBy(
  o => o.n,
  list({ n: 4, m: "foo" }, { n: 3, m: "bar" }, { n: 1, m: "baz" })
);
//=> list({ n: 1, m: "baz" }, { n: 3, m: "bar" }, { n: 4, m: "foo" })

sortBy(s => s.length, list("foo", "bar", "ba", "aa", "list", "z"));
//=> list("z", "ba", "aa", "foo", "bar", "list")
```

### `sortWith`

Sort the given list by comparing values using the given function. The function
receieves two values and should return `-1` if the first value is stricty
larger than the second, `0` is they are equal and `1` if the first values is
strictly smaller than the second.

Note that the comparison function is equivalent to the one required by
[`Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).

Performs a stable sort.

**Complexity**: `O(n * log(n))`

**Example**

```js
sortWith((a, b) => {
  if (a === b) {
    return 0;
  } else if (a < b) {
    return -1;
  } else {
    return 1;
  }
}, list(5, 3, 1, 8, 2)); //=> list(1, 2, 3, 5, 8)
```

### `group`

Returns a list of lists where each sublist's elements
are all equal.

**Complexity**: `O(n)`

**Example**

```js
group(list(0, 0, 1, 2, 2, 2, 3, 3)); //=> list(list(0, 0), list(1), list(2, 2, 2), list(3, 3))
```

### `groupWith`

Returns a list of lists where each sublist's elements are pairwise
equal based on the given comparison function.

Note that only adjacent elements are compared for equality. If all
equal elements should be grouped together the list should be sorted
before grouping.

**Complexity**: `O(n)`

**Example**

```js
const floorEqual = (a, b) => Math.round(a) === Math.round(b);
groupWith(floorEqual, list(1.1, 1.3, 1.8, 2, 2.2, 3.3, 3.4));
//=> list(list(1.1, 1.3), list(1.8, 2, 2.2), list(3.3, 3.4))

const sameLength = (a, b) => a.length === b.length;
groupWith(sameLength, list("foo", "bar", "ab", "bc", "baz"));
//=> list(list("foo", "bar"), list("ab", "bc"), list("baz))
```

### Folds

### `isList`

Returns `true` if the given argument is a list.

**Complexity**: `O(1)`

**Example**

```js
isList([0, 1, 2]); //=> false
isList("string"); //=> false
isList({ foo: 0, bar: 1 }); //=> false
isList(list(0, 1, 2)); //=> true
```

### `equals`

Returns true if the two lists are equivalent.

**Complexity**: `O(n)`

**Example**

```js
equals(list(0, 1, 2, 3), list(0, 1, 2, 3)); //=> true
equals(list("a", "b", "c"), list("a", "z", "c")); //=> false
```

### `equalsWith`

Returns `true` if the two lists are equivalent when comparing each
pair of elements with the given comparison function.

**Complexity**: `O(n)`

**Example**

```js
equalsWith(
  (n, m) => n.length === m.length,
  list("foo", "hello", "one"),
  list("bar", "world", "two")
); //=> true
```

### `toArray`

Converts a list into an array.

**Complexity**: `O(n)`

**Example**

```js
toArray(list(0, 1, 2, 3, 4)); //=> [0, 1, 2, 3, 4]
```

### `backwards`

Returns an iterable that iterates backwards over the given list.

**Complexity**: `O(1)`

**Example**

```js
const l = list(0, 1, 2, 3, 4)
for (const n of backwards(l)) {
  if (l < 2) {
    break;
  }
  console.log(l);
}
// => logs 4, 3, and then 2
```

### `nth`

Gets the `n`th element of the list. If `n` is out of bounds
`undefined` is returned.

**Complexity**: `O(log(n))`, practically constant

**Example**

```js
const l = list(0, 1, 2, 3, 4);
nth(2, l); //=> 2
```

### `length`

Returns the length of a list. I.e. the number of elements that it
contains.

**Complexity**: `O(1)`

**Example**

```js
length(list(0, 1, 2, 3)); //=> 4
```

### `first`

Returns the first element of the list. If the list is empty the
function returns `undefined`.

**Aliases**: `head`

**Complexity**: `O(1)`

**Example**

```js
first(list(0, 1, 2, 3)); //=> 0
first(list()); //=> undefined
```

### `last`

Returns the last element of the list. If the list is empty the
function returns `undefined`.

**Complexity**: `O(1)`

**Example**

```js
last(list(0, 1, 2, 3)); //=> 3
last(list()); //=> undefined
```

### `foldl`

Folds a function over a list. Left-associative.

**Aliases**: `reduce`

**Complexity**: `O(n)`

**Example**

```js
foldl((n, m) => n - m, 1, list(2, 3, 4, 5));
1 - 2 - 3 - 4 - 5; //=> -13
```

### `foldr`

Folds a function over a list. Right-associative.

**Aliases**: `reduceRight`

**Complexity**: `O(n)`

**Example**

```js
foldr((n, m) => n - m, 5, list(1, 2, 3, 4));
1 - (2 - (3 - (4 - 5))); //=> 3
```

### `foldlWhile`

Similar to `foldl`. But, for each element it calls the predicate function
_before_ the folding function and stops folding if it returns `false`.

**Aliases**: `reduceWhile`

**Complexity**: `O(n)`

**Example**

```js
const isOdd = (_acc:, x) => x % 2 === 1;

const xs = L.list(1, 3, 5, 60, 777, 800);
foldlWhile(isOdd, (n, m) => n + m, 0, xs) //=> 9

const ys = L.list(2, 4, 6);
foldlWhile(isOdd, (n, m) => n + m, 111, ys) //=> 111
```

### `scan`

Folds a function over a list from left to right while collecting all the
intermediate steps in a resulting list.

**Complexity**: `O(n)`

**Example**

```js
const l = list(1, 3, 5, 4, 2);
L.scan((n, m) => n + m, 0, l); //=> list(0, 1, 4, 9, 13, 15));
L.scan((s, m) => s + m.toString(), "", l); //=> list("", "1", "13", "135", "1354", "13542")
```

### `traverse`

Map each element of list to an applicative, evaluate these
applicatives from left to right, and collect the results.

This works with Fantasy Land
[applicatives](https://github.com/fantasyland/fantasy-land#applicative).

**Complexity**: `O(n)`

**Example**

```js
const safeDiv = n => d => d === 0 ? nothing : just(n / d)

L.traverse(Maybe, safeDiv(10), list(2, 4, 5)); //=> just(list(5, 2.5, 2))
L.traverse(Maybe, safeDiv(10), list(2, 0, 5)); //=> nothing
```

### `sequence`

Evaluate each applicative in the list from left to right, and
collect the results.

**Complexity**: `O(n)`

**Example**

```js
L.sequence(Maybe, list(just(1), just(2), just(3))); //=> just(list(1, 2, 3))
L.sequence(Maybe, list(just(1), just(2), nothing())); //=> nothing
```

### `forEach`

Invokes a given callback for each element in the list from left to
right. Returns `undefined`.

This function is very similar to `map`. It should be used instead of
`map` when the mapping function has side-effects. Whereas `map`
constructs a new list `forEach` merely returns `undefined`. This makes
`forEach` faster when the new list is unneeded.

**Complexity**: `O(n)`

**Example**

```js
const l = list(0, 1, 2);
forEach(element => console.log(element));
//=> 0
//=> 1
//=> 2
```

### `every`

Returns `true` if and only if the predicate function returns `true`
for all elements in the given list.

**Aliases**: `all`

**Complexity**: `O(n)`

**Example**

```js
const isEven = n => n % 2 === 0;
every(isEven, empty()); //=> true
every(isEven, list(2, 4, 6, 8)); //=> true
every(isEven, list(2, 3, 4, 6, 7, 8)); //=> false
every(isEven, list(1, 3, 5, 7)); //=> false
```

### `some`

Returns `true` if and only if there exists an element in the list for
which the predicate returns `true`.

**Aliases**: `any`

**Complexity**: `O(n)`

**Example**

```js
const isEven = n => n % 2 === 0;
some(isEven, empty()); //=> false
some(isEven, list(2, 4, 6, 8)); //=> true
some(isEven, list(2, 3, 4, 6, 7, 8)); //=> true
some(isEven, list(1, 3, 5, 7)); //=> false
```

### `indexOf`

Returns the index of the _first_ element in the list that is equal to
the given element. If no such element is found `-1` is returned.

**Complexity**: `O(n)`

**Example**

```js
const l = list(12, 4, 2, 89, 6, 18, 7);
indexOf(12, l); //=> 0
indexOf(89, l); //=> 3
indexOf(10, l); //=> -1
```

### `lastIndexOf`

Returns the index of the _last_ element in the list that is equal to
the given element. If no such element is found `-1` is returned.

**Complexity**: `O(n)`

**Example**

```js
const l = L.list(12, 4, 2, 18, 89, 2, 18, 7);
L.lastIndexOf(18, l); //=> 6
L.lastIndexOf(2, l); //=> 5
L.lastIndexOf(12, l); //=> 0
```

### `find`

Returns the _first_ element for which the predicate returns `true`. If
no such element is found the function returns `undefined`.

**Complexity**: `O(n)`

**Example**

```js
find(isEven, list(1, 3, 5, 6, 7, 9, 10)); //=> 6
find(isEven, list(1, 3, 5, 7, 9)); //=> undefined
```

### `findLast`

Returns the _last_ element for which the predicate returns `true`. If
no such element is found the function returns `undefined`.

**Complexity**: `O(n)`

**Example**

```js
findLast(isEven, list(1, 3, 5, 6, 7, 8, 9)); //=> 8
findLast(isEven, list(1, 3, 5, 7, 9)); //=> undefined
```

### `findIndex`

Returns the index of the first element for which the predicate returns
`true`. If no such element is found the function returns `-1`.

**Complexity**: `O(n)`

**Example**

```js
findIndex(isEven, list(1, 3, 5, 6, 7, 9, 10)); //=> 3
findIndex(isEven, list(1, 3, 5, 7, 9)); //=> -1
```

### `none`

Returns `true` if and only if the predicate function returns `false`
for all elements in the given list.

**Complexity**: `O(n)`

**Example**

```js
const isEven = n => n % 2 === 0;
none(isEven, empty()); //=> true
none(isEven, list(2, 4, 6, 8)); //=> false
none(isEven, list(2, 3, 4, 6, 7, 8)); //=> false
none(isEven, list(1, 3, 5, 7)); //=> true
```

### `includes`

Returns `true` if the list contains the specified element. Otherwise
it returns `false`.

**Aliases**: `contains`

**Complexity**: `O(n)`

**Example**

```js
includes(3, list(0, 1, 2, 3, 4, 5)); //=> true
includes(3, list(0, 1, 2, 4, 5)); //=> false
```

### `join`

Concats the strings in a list separated by a specified separator.

**Complexity**: `O(n)`

**Example**

```js
join(", ", list("one", "two", "three")); //=> "one, two, three"
```

## Benchmarks

The benchmarks are located in the [`bench` directory](/test/bench).
