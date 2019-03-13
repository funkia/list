import { assert } from "chai";
import * as fc from "fast-check";
import * as L from "../src";

type Real = { data: L.List<number> };
type Model = { data: number[] };

export class ConcatCommand implements fc.Command<Model, Real> {
  constructor(readonly source: number[]) {}
  check(/*m: Readonly<Model>*/): boolean {
    return true;
  }
  run(m: Model, r: Real): void {
    m.data = [...m.data, ...this.source];
    r.data = L.concat(r.data, L.from(this.source));
    assert.deepEqual(L.toArray(r.data), m.data);
  }
  toString(): string {
    return `L.concat(src, L.from([${this.source.join(",")}]))`;
  }
}

export class DropCommand implements fc.Command<Model, Real> {
  constructor(readonly num: number) {}
  check(/*m: Readonly<Model>*/): boolean {
    return true;
  }
  run(m: Model, r: Real): void {
    m.data = m.data.slice(this.num);
    r.data = L.drop(this.num, r.data);
    assert.deepEqual(L.toArray(r.data), m.data);
  }
  toString(): string {
    return `L.drop(${this.num}, src)`;
  }
}

export class TakeCommand implements fc.Command<Model, Real> {
  constructor(readonly num: number) {}
  check(/*m: Readonly<Model>*/): boolean {
    return true;
  }
  run(m: Model, r: Real): void {
    m.data = m.data.slice(0, this.num);
    r.data = L.take(this.num, r.data);
    assert.deepEqual(L.toArray(r.data), m.data);
  }
  toString(): string {
    return `L.take(${this.num}, src)`;
  }
}

export class MapCommand implements fc.Command<Model, Real> {
  constructor(readonly val: number) {}
  check(/*m: Readonly<Model>*/): boolean {
    return true;
  }
  run(m: Model, r: Real): void {
    m.data = m.data.map(v => (v * this.val) | 0);
    r.data = L.map(v => (v * this.val) | 0, r.data);
    assert.deepEqual(L.toArray(r.data), m.data);
  }
  toString(): string {
    return `L.map(v => (v * ${this.val}) | 0, src)`;
  }
}

export class ReverseCommand implements fc.Command<Model, Real> {
  constructor() {}
  check(/*m: Readonly<Model>*/): boolean {
    return true;
  }
  run(m: Model, r: Real): void {
    m.data = m.data.reverse();
    r.data = L.reverse(r.data);
    assert.deepEqual(L.toArray(r.data), m.data);
  }
  toString(): string {
    return `L.reverse(src)`;
  }
}

export class ConcatPreCommand implements fc.Command<Model, Real> {
  constructor(readonly source: number[]) {}
  check(/*m: Readonly<Model>*/): boolean {
    return true;
  }
  run(m: Model, r: Real): void {
    m.data = [...this.source, ...m.data];
    r.data = L.concat(L.from(this.source), r.data);
    assert.deepEqual(L.toArray(r.data), m.data);
  }
  toString(): string {
    return `L.concat(L.from([${this.source.join(",")}]), src)`;
  }
}

export class FilterCommand implements fc.Command<Model, Real> {
  constructor(readonly val: number) {}
  check(/*m: Readonly<Model>*/): boolean {
    return true;
  }
  run(m: Model, r: Real): void {
    m.data = m.data.filter(v => v >= this.val);
    r.data = L.filter(v => v >= this.val, r.data);
    assert.deepEqual(L.toArray(r.data), m.data);
  }
  toString(): string {
    return `L.filter(v => v >= ${this.val}, src)`;
  }
}
