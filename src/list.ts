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

export function copyFirst<A>(n: number, list: Cons<A>): Cons<A> {
  const newHead = new Cons(list.value, undefined);
  let current = list;
  let newCurrent = newHead;
  while (--n > 0) {
    current = current.next;
    const cons = new Cons(current.value, undefined);
    newCurrent.next = cons;
    newCurrent = cons;
  }
  return newHead;
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
