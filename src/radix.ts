import { Cons } from "./list";

const mask = 31;

function createPath(depth: number, value: any) {
  const top = new Block(1, []);
  let current = top;
  for (let i = 0; i < depth; ++i) {
    let temp = new Block(1, []);
    current.array[0] = temp;
    current = temp;
  }
  current.array[0] = value;
  return top;
}

function copyArray(source: any[]) {
  const array = [];
  for (let i = 0; i < source.length; ++i) {
    array[i] = source[i];
  }
  return array;
}

class Block {
  private owner: boolean;
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

export class Radix<A> {
  private constructor(
    private depth: number,
    private size: number,
    private block: Block,
    private suffix: Cons<A> | undefined,
    private suffixSize: number
  ) { }
  space(): number {
    return (32 ** (this.depth + 1)) - (this.size - this.suffixSize);
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
