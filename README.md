# @funkia/list

A fast immutable lists. A purely functional general purpose
replacement for arrays.

[![Gitter](https://img.shields.io/gitter/room/funkia/General.svg)](https://gitter.im/funkia/General)
[![Build Status](https://travis-ci.org/funkia/list.svg?branch=master)](https://travis-ci.org/funkia/list)
[![codecov](https://codecov.io/gh/funkia/list/branch/master/graph/badge.svg)](https://codecov.io/gh/funkia/list)

Work in progress :construction:

## Features

* Very good performance
* API centered around functions with arguments ordered for
  currying/partial application
* [Seamless Ramda integration](#seamless-ramda-integration).
* TypeScript support
* [Fantasy Land support](#fantasy-land)
* Full compatibility with tree-shaking. Only pay in size for the
  functions that you actually use.

## What & why?

List is a purely functional alternative to arrays. It's a replacement
for arrays for JavaScript developers that do purely functional
programming.

List is a data-structure that stores elements in a sequence. Just like
arrays. The difference is that arrays is a mutable data-structure
optimized for imperative programming. List on the other hand is an
immutable data-structure optimized for purely functional programming.

Since List is immutable it provides increased safety compared to
arrays. It is impossible to accidentally mutate a list because it
offers no API for mutating it. If you're doing functional programming
with arrays their impure API is nothing but a source of bugs.

Due to the way List is implemented it can be many times faster than
arrays for functional programming. If, for instance, you concatenate
two arrays both arrays will have to be copied into a new array. This
is because potential mutations to the old arrays must not affect the
new concatenated array. Since List is immutable that problem goes away
and the concatenated list can share the majority of its structure with
the old lists. This reduces copying, reduces memory allocations, and
results in much better performance.

## Seamless Ramda integration

List aims to integrate with Ramda in a way that is straightforward and
seamless.

### Implemented functions

This keeps track of how many of the Ramda functions for Arrays that
has currently been implemented on the immutable list: 29/115

Implemented: `adjust`, `all`, `any`, `append`, `concat`, `contains`,
`drop`, `dropLast`, `filter`, `find`, `findIndex`, `head`, `init`,
`last`, `length`, `map`, `none`, `nth`, `pair`, `prepend`, `range`,
`reduce`, `reduceRight`, `reject`, `repeat`, `slice`, `take`, `tail`,
`takeLast`, `update`.

Not implemented: `aperture`, `chain`, `dropLastWhile`, `dropRepeats`,
`dropRepeatsWith`, `dropWhile`, `endsWith`, `findLast`,
`findLastIndex`, `flatten`, `fromPairs`, `groupBy`, `groupWith`,
`indexBy`, `indexOf`, `insert`, `insertAll`, `intersperse`, `join`,
`lastIndexOf`, `mapAccum`, `mapAccumRight`, `mergeAll`, `partition`,
`pluck`, `reduceBy`, `reduceWhile`, `remove`, `reverse`, `scan`,
`sequence`, `sort`, `splitAt`, `splitEvery`, `splitWhen`,
`startsWith`, `takeLastWhile`, `takeWhile`, `times`, `transpose`,
`traverse`, `unfold`, `uniq`, `uniqBy`, `uniqWith`, `unnest`
`without`, `xprod`, `zip`, `zipObj`, `zipWith`.

## Fantasy Land

Implemented: Semigroup, monoid, foldable, functor.

Not implemented yet: Setoid, apply, applicative, traversable, chain,
monad.

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

### `update`

Returns a list that has the entry specified by the index replaced with
the given value.

**Complexity**: `O(logn)`

**Example**

```js
update(2, "X", list("a", "b", "c", "d", "e")); //=> list("a", "b", "X", "d", "e")
```

### `adjust`

Returns a list that has the entry specified by the index replaced with
the value returned by applying the function to the value.

**Complexity**: `O(logn)`

**Example**

```js
take(3, list(0, 1, 2, 3, 4, 5)); //=> list(0, 1, 2)
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

### `takeLast`

Takes the last `n` elements from a list and returns them in a new list.

**Complexity**: `O(log(n))`

**Example**

```js
takeLast(3, list(0, 1, 2, 3, 4, 5)); //=> list(3, 4, 5)
```

### `drop`

Returns a new list without the first `n` elements.

**Complexity**: `O(log(n))`

**Example**

```js
drop(2, list(0, 1, 2, 3, 4, 5)); //=> list(2, 3, 4, 5)
```

### `dropLast`

Returns a new list without the first `n` elements.

**Complexity**: `O(log(n))`

**Example**

```js
dropLast(2, list(0, 1, 2, 3, 4, 5)); //=> list(0, 1, 2, 3)
```

### `tail`

Returns a new list with the first element removed.

**Complexity**: `O(1)`

**Example**

```js
tail(list(0, 1, 2, 3)); //=> list(1, 2, 3)
```

### `pop`

Returns a new list with the last element removed.

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
filter(isEven, list(0, 1, 2, 3, 4, 5, 6)); //=> list(1, 3, 5)
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

### `find`

Returns the first element for which the predicate returns `true`. If
no such element is found the function returns `undefined`.

**Complexity**: `O(n)`

**Example**

```js
find(isEven, list(1, 3, 5, 6, 7, 9, 10)); //=> 6
find(isEven, list(1, 3, 5, 7, 9)); //=> undefined
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
const isEven = (n) => n % 2 === 0;
none(isEven, empty()); //=> true
none(isEven, list(2, 4, 6, 8)); //=> false
none(isEven, list(2, 3, 4, 6, 7, 8)); //=> false
none(isEven, list(1, 3, 5, 7)); //=> true

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
