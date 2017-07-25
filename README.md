# @funkia/list

A fast immutable lists. Purely functional general purpose replacement
for arrays.

## Status

Experimental :construction: Basic functionality is missing. Benchmarks
of implemented functions look promising.

## Goals

* Very good performance
* Functional Ramda-like API. Curried functions, etc.
* TypeScript support
* Fantasy Land support
* Full compatibility with tree-shaking. Only pay in size for the
  functions that you actually use.

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

## Benchmarks

Run the benchmarks like this.

```
cd bench
./prepare-benchmarks.sh
npm run bench
```