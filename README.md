# @funkia/list

A fast immutable lists. Purely functional general purpose replacement
for arrays.

[![Gitter](https://img.shields.io/gitter/room/funkia/General.svg)](https://gitter.im/funkia/General)
[![Build Status](https://travis-ci.org/funkia/list.svg?branch=master)](https://travis-ci.org/funkia/list)
[![codecov](https://codecov.io/gh/funkia/list/branch/master/graph/badge.svg)](https://codecov.io/gh/funkia/list)

## Status

Experimental :construction:

Basic functionality is missing. Benchmarks of implemented functions
look promising.

## Goals

* Very good performance
* API centered around functions with arguments ordered for
  currying/partial application
* Seamless Ramda integration by duplicating their API for arrays
* TypeScript support
* Fantasy Land support
* Full compatibility with tree-shaking. Only pay in size for the
  functions that you actually use

## Progress

### Fantasy Land

Implemented: Functor

Not implemented yet: Setoid, semigroup, monoid, apply, applicative,
foldable, traversable, chain, monad.

### Rambda compatibility

This keeps track of how many of the Ramda functions for Arrays that has currently been implemented on the immutable list: 9/115

adjust, all, any, aperture, ~~append~~, chain, ~~concat~~, contains,
drop, dropLast, dropLastWhile, dropRepeats, dropRepeatsWith,
dropWhile, endsWith, filter, find, findIndex, findLast, findLastIndex,
flatten, fromPairs, groupBy, groupWith, head, indexBy, indexOf, init,
insert, insertAll, intersperse, join, ~~last~~, lastIndexOf,
~~length~~, ~~map~~, mapAccum, mapAccumRight, mergeAll, none, ~~nth~~,
~~pair~~, partition, pluck, prepend, ~~range~~, ~~reduce~~, reduceBy,
reduceRight, reduceWhile, reject, remove, repeat, reverse, scan,
sequence, slice, sort, splitAt, splitEvery, splitWhen, startsWith,
tail, take, takeLast, takeLastWhile, takeWhile, times, transpose,
traverse, unfold, uniq, uniqBy, uniqWith, unnest, update, without,
xprod, zip, zipObj, zipWith

## API

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

### `concat`

Concatenates two lists.

**Complexity**: `O(logn)`

**Example**

```js
concat(list(0, 1, 2), list(3, 4)); //=> list(0, 1, 2, 3, 4)
```

### `append`

Appends an element to the end of a list and returns the new list.

**Complexity**: `O(logn)`, practically constant

**Example**

```js
const newList = append(3, list(0, 1, 2)); //=> list(0, 1, 2, 3)
```

### `nth`

Gets the `n`th element of the list.

**Complexity**: `O(logn)`, practically constant

**Example**

```js
const l = list(0, 1, 2, 3, 4);
nth(2, l); //=> 2
```

### `range`

Returns a list of numbers between an an inclusive lower bound to an
exclusive upper bound.

**Complexity**: `O(n)`

**Example**

```js
range(3, 8); //=> list(3, 4, 5, 6, 7)
```

### `length`

Returns the length of a list. I.e. the number of elements that it
contains.

**Complexity**: `O(1)`

**Example**

```js
length(list(0, 1, 2, 3)); //=> 4
```

### `last`

Returns the last element of the list. If the list is empty the
function returns undefined.

**Complexity**: `O(1)`

**Example**

```js
last(list(0, 1, 2, 3)); //=> 3
last(list()); //=> undefined
```

### `map`

Applies a function to each element in the given list and returns a new
list with the values that the function return.

**Complexity**: `O(n)`

**Example**

```js
map((n) => n * n, list(0, 1, 2, 3, 4)); //=> list(0, 1, 4, 9, 12)
```

### `foldl`

Folds a function over a list.

**Aliases**: `reduce`

**Complexity**: `O(n)`

**Example**

```js
foldl((n, m) => n - m, 1, list(2, 3, 4, 5)); //=> -8
```

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