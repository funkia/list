export class Cons<A> {
  constructor(
    public value: A,
    public next: Cons<A> | undefined
  ) {}
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
