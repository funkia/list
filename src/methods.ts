import { List, append, nth } from "./index";

declare module "./index" {
  interface List<A> {
    append(value: A): List<A>;
    nth(index: number): A | undefined;
  }
}

List.prototype.append = function<A>(value: A): List<A> {
  return append(value, this);
};

List.prototype.nth = function<A>(index: number): A | undefined {
  return nth(index, this);
};
