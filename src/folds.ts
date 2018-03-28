import { List, foldl, empty, prepend } from "./core";

/**
 * Reverses a list.
 * @category Updater
 * @param l The list to reverse.
 * @returns A reversed list.
 */
export function reverse<A>(l: List<A>): List<A> {
  return foldl((newL, element) => prepend(element, newL), empty(), l);
}
