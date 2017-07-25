# @funkia/list

An immutable lists.

## Status

Experimental :construction:. There is bugs and basic functionality is
missing. Benchmarks are promising.

## Goals

* Very good performance
* Functional Ramda-like API
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
const newList = append(foo, list(0, 1, 2)); //=> list(0, 1, 2, 0)
```
### `nth`

Get's the `n`th element of the list.

**Complexity**: `O(logn)`, practically constant

**Example**

```js
const l = list(0, 1, 2, 3, 4);
nth(2, l); //=> 2
```