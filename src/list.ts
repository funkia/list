export class Cons<A> {
  constructor(
    public value: A,
    public next: Cons<A> | undefined
  ) {}
}
