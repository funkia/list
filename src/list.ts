export class Cons<A> {
  constructor(public value: A, public next: Cons<A> | undefined) { }
  toArray(): A[] {
    const array = [];
    let cur: Cons<A> = this;
    while (cur !== undefined) {
      array.push(cur.value);
      cur = cur.next;
    }
    return array;
  }
  nth(index: number): A {
    let cur: Cons<A> = this;
    for (let i = 0; i < index; ++i) {
      cur = cur.next;
    }
    return cur.value;
  }
}

export function concat<A>(a: Cons<A>, b: Cons<A>): Cons<A> {
  let list = new Cons(a.value, undefined);
  let prev = list;
  let cur = a;
  while ((cur = cur.next) !== undefined) {
    prev.next = new Cons(cur.value, undefined);
    prev = prev.next;
  }
  prev.next = b;
  return list;
}
