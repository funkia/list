import { Cons } from "./list";

const blockSize = 32;
const mask = 31;

function createPath(depth: number, value: any) {
  const top = new Block([]);
  let current = top;
  for (let i = 0; i < depth; ++i) {
    let temp = new Block([]);
    current.array[0] = temp;
    current = temp;
  }
  current.array[0] = value;
  return top;
}

function copyArray(source: any[]): any[] {
  const array = [];
  for (let i = 0; i < source.length; ++i) {
    array[i] = source[i];
  }
  return array;
}

export class Block {
  private owner: boolean;
  public sizes: number[];
  constructor(public array: any[]) {
    this.owner = true;
  }
  copy(): Block {
    const result = new Block(copyArray(this.array));
    return result;
  }
  append(value: any): Block {
    let array;
    if (this.owner) {
      this.owner = false;
      array = this.array;
    } else {
      array = copyArray(this.array);
    }
    array.push(value);
    return new Block(array);
  }
  update(depth: number, index: number, value: any): Block {
    const path = (index >> (depth * 5)) & mask;
    // const result = this.copy();
    const array = this.getArray();
    if (depth === 0) {
      array[path] = value;
    } else {
      let child = this.array[path];
      if (child === undefined) {
        array[path] = createPath(depth - 1, value);
      } else {
        array[path] = child.update(depth - 1, index, value);
      }
    }
    return new Block(array);
  }
  nth(depth: number, index: number): any {
    const path = (index >> (depth * 5)) & mask;
    if (depth === 0) {
      return this.array[path];
    } else {
      return (this.array[path] as Block).nth(depth - 1, index);
    }
  }
  private getArray(): any[] {
    if (this.owner) {
      this.owner = false;
      return this.array;
    } else {
      return copyArray(this.array);
    }
  }
}

function arrayFirst<A>(array: A[]): A {
  return array[0];
}

function arrayLast<A>(array: A[]): A {
  return array[array.length];
}

export class Radix<A> {
  constructor(
    public depth: number,
    public size: number,
    public block: Block,
    private suffix: Cons<A> | undefined,
    private suffixSize: number
  ) { }
  space(): number {
    return (blockSize ** (this.depth + 1)) - (this.size - this.suffixSize);
  }
  append(value: A): Radix<A> {
    if (this.suffixSize < 31) {
      return new Radix<A>(
        this.depth,
        this.size + 1,
        this.block,
        new Cons(value, this.suffix),
        this.suffixSize + 1
      );
    }
    const suffixArray = this.suffix.toArray().reverse();
    suffixArray.push(value);
    const suffixBlock = new Block(suffixArray);
    if (this.size === 31) {
      return new Radix<A>(
        0, this.size + 1, suffixBlock, undefined, 0
      );
    }
    const full = this.space() === 0;
    let block;
    if (full) {
      if (this.depth === 0) {
        block = new Block([this.block, suffixBlock]);
      } else {
        block = new Block([this.block, createPath(this.depth - 1, suffixBlock)]);
      }
    } else {
      block = this.block.update(this.depth - 1, this.size >> 5, suffixBlock);
    }
    return new Radix<A>(
      this.depth + (full ? 1 : 0), this.size + 1, block, undefined, 0
    );
  }
  nth(index: number): A | undefined {
    if (index >= this.size - this.suffixSize) {
      return this.suffix.nth(this.size - 1 - index);
    }
    return this.block.nth(this.depth, index);
  }
  static empty(): Radix<any> {
    return new Radix(0, 0, new Block([]), undefined, 0);
  }
}

export function empty(): Radix<any> {
  return Radix.empty();
}

const eMax = 2;

function createConcatPlan(array: Block[]): number[] | undefined {
  const sizes = [];
  let sum = 0;
  for (let i = 0; i < array.length; ++i) {
    sum += array[i].array.length;
    sizes[i] = array[i].array.length;
  }
  const optimalLength = Math.ceil(sum / blockSize);
  let n = array.length;
  let i = 0;
  if (optimalLength + eMax >= n) {
    return undefined; // no rebalancing needed
  }
  while (optimalLength + eMax < n) {
    while (sizes[i] <= blockSize - (eMax / 2)) {
      // Skip blocks that are already sufficiently balanced
      ++i;
    }
    let r = sizes[i];
    while (r > 0) {
      const minSize = Math.min(r + sizes[i + 1], blockSize);
      sizes[i] = minSize;
      r = r + sizes[i + 1] - minSize;
      ++i; // Maybe change to for-loop
    }
    for (let j = i; j <= n - 1; ++j) {
      sizes[i] = sizes[i + 1];
    }
    --i;
    --n;
  }
  sizes.length = n;
  return sizes;
}

function concatNodeMerge<A>(left: Block, center: Block, right: Block): any[] {
  return left.array.slice(0, -1).concat(center.array, right.array.slice(1));
}

function executeConcatPlan(merged: any[], plan: number[]): any[] {
  let offset = 0;
  const result = [];
  for (const toMove of plan) {
    const block = new Block([]);
    for (let i = 0; i < toMove; ++i) {
      block.array[i] = merged[offset++];
    }
    result.push(block);
  }
  return result;
}

function rebalance<A>(
  left: Block, center: Block, right: Block, top: boolean
): Block {
  const merged = concatNodeMerge(left, center, right);
  const plan = createConcatPlan(merged);
  const balanced =
    plan !== undefined ? executeConcatPlan(merged, plan) : merged;
  if (balanced.length < blockSize) {
    if (top === false) {
      // Return a single block with extra height for balancing at next
      // level
      return new Block([new Block(balanced)]);
    }
  } else {
    return new Block([
      new Block(balanced.slice(0, blockSize)),
      new Block(balanced.slice(blockSize))
    ]);
  }
}

function concatSubTrie<A>(
  left: Block, lDepth: number, right: Block, rDepth: number, top: boolean
): Block {
  if (lDepth > rDepth) {
    const c = concatSubTrie(arrayLast(left.array), lDepth - 1, right, rDepth, false);
    return rebalance(left, c, undefined, false);
  } else if (lDepth < rDepth) {
    const c = concatSubTrie(left, lDepth, arrayFirst(right.array), rDepth - 1, false);
    return rebalance(undefined, c, right, false);
  } else if (lDepth === 0) {
    const array = [];
    if (top && left.array.length + right.array.length <= blockSize) {
      return new Block(left.array.concat(right.array));
    }
  } else {
    const c = concatSubTrie<A>(
      arrayLast(left.array),
      lDepth - 1,
      arrayFirst(right.array),
      rDepth - 1,
      false
    );
    return rebalance(left, c, right, false);
  }
}

export function concat<A>(left: Radix<A>, right: Radix<A>): Radix<A> {
  if (left.size === 0) {
    return right;
  } else if (right.size === 0) {
    return left;
  } else {
    return left;
  }
}
