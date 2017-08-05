# @funkia/list

A fast immutable lists. Purely functional general purpose replacement
for arrays.

[![Gitter](https://img.shields.io/gitter/room/funkia/General.svg)](https://gitter.im/funkia/General)
[![Build Status](https://travis-ci.org/funkia/list.svg?branch=master)](https://travis-ci.org/funkia/list)
[![codecov](https://codecov.io/gh/funkia/list/branch/master/graph/badge.svg)](https://codecov.io/gh/funkia/list)

Work in progress :construction:


## Goals

* Very good performance
* API centered around functions with arguments ordered for
  currying/partial application
* Seamless Ramda integration by duplicating their API for arrays
* TypeScript support
* Fantasy Land support
* Full compatibility with tree-shaking. Only pay in size for the
  functions that you actually use.

## Progress

### Fantasy Land

Implemented: Functor, semigroup, monoid.

Not implemented yet: Setoid, apply, applicative,
foldable, traversable, chain, monad.

### Rambda compatibility

This keeps track of how many of the Ramda functions for Arrays that
has currently been implemented on the immutable list: 17/115

Implemented: all, any, append, concat, head, last, length, map, none,
nth, pair, prepend, range, reduce, reduceRight, repeat, take.

Not implemented: adjust, aperture, chain, contains, drop, dropLast,
dropLastWhile, dropRepeats, dropRepeatsWith, dropWhile, endsWith,
filter, find, findIndex, findLast, findLastIndex, flatten, fromPairs,
groupBy, groupWith, indexBy, indexOf, init, insert, insertAll,
intersperse, join, lastIndexOf, mapAccum, mapAccumRight, mergeAll,
partition, pluck, reduceBy, reduceWhile, reject, remove, reverse,
scan, sequence, slice, sort, splitAt, splitEvery, splitWhen,
startsWith, tail, takeLast, takeLastWhile, takeWhile, times,
transpose, traverse, unfold, uniq, uniqBy, uniqWith, unnest, update,
without, xprod, zip, zipObj, zipWith.

## API

The API is organized into three parts.

1. Functions that create lists.
2. Functions that takes one or more lists as argument and returns a
   new list. I.e. functions that updates lists.
3. Function that takes one or more lists as arguments and returns
   something that is not a list.

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

### `pair`

Takes two arguments and returns a list that contains them.

**Complexity**: `O(1)`

**Example**

```js
pair("foo", "bar"); //=> list("foo", "bar")
```

### `range`

Returns a list of numbers between an an inclusive lower bound and an
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

### Updating lists

### `concat`

Concatenates two lists.

**Complexity**: `O(logn)`

**Example**

```js
concat(list(0, 1, 2), list(3, 4)); //=> list(0, 1, 2, 3, 4)
```

### `prepend`

Prepends an element to the front of a list and returns the new list.

**Complexity**: `O(logn)`, practically constant

**Example**

```js
const newList = prepend(0, list(1, 2, 3)); //=> list(0, 1, 2, 3)
```

### `append`

Appends an element to the end of a list and returns the new list.

**Complexity**: `O(logn)`, practically constant

**Example**

```js
const newList = append(3, list(0, 1, 2)); //=> list(0, 1, 2, 3)
```

### `map`

Applies a function to each element in the given list and returns a new
list with the values that the function return.

**Complexity**: `O(n)`

**Example**

```js
map((n) => n * n, list(0, 1, 2, 3, 4)); //=> list(0, 1, 4, 9, 12)
```

### Folds

### `nth`

Gets the `n`th element of the list.

**Complexity**: `O(logn)`, practically constant

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
foldl((n, m) => n - m, 1, list(2, 3, 4, 5)); (((1 - 2) - 3) - 4) - 5 //=> -13
```

### `foldr`

Folds a function over a list. Right-associative.

**Aliases**: `reduceRight`
**Aliases**: `reduceRight`

**Complexity**: `O(n)`

**Example**

```js
foldr((n, m) => n - m, 5, list(1, 2, 3, 4)); 1 - (2 - (3 - (4 - 5))) //=> 3
```

### `take`

Takes the first `n` elements from a list and returns them in a new list.

**Complexity**: `O(n)`

**Example**

```js
take(3, list(0, 1, 2, 3, 4, 5)); //=> list(0, 1, 2)
```

### `every`

Returns `true` if and only if the predicate function returns `true`
for all elements in the given list.

**Aliases**: `all`

**Complexity**: `O(n)`

**Example**

```js
const isEven = (n) => n % 2 === 0;
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
const isEven = (n) => n % 2 === 0;
some(isEven, empty()); //=> false
some(isEven, list(2, 4, 6, 8)); //=> true
some(isEven, list(2, 3, 4, 6, 7, 8)); //=> true
some(isEven, list(1, 3, 5, 7)); //=> false
```

### `none`

Returns `true` if and only if the predicate function returns `false`
for all elements in the given list.

**Complexity**: `O(n)`

**Example**

```js
const isEven = (n) => n % 2 === 0;
none(isEven, empty()); //=> true
none(isEven, list(2, 4, 6, 8)); //=> false
none(isEven, list(2, 3, 4, 6, 7, 8)); //=> false
none(isEven, list(1, 3, 5, 7)); //=> true

## Benchmarks

The benchmarks are located in the [`bench` directory](/bench).

Run the benchmarks like this (starting with CWD in the root).

```
npm install
npm run build
cd bench
npm install
./prepare-benchmarks.sh
npm run bench
```

Note that in the output `List` corresponds to @funkia/list.