import { Fold } from './tuple.api';

interface ITuple<E, A> {
  mapFirst: <F>(fef: (e: E) => F) => Tuple<F, A>,
  mapSecond: <B>(fab: (a: A) => B) => Tuple<E, B>,
  mapBoth:  <B, F>(fef: (e: E) => F, fab: (a: A) => B) => Tuple<F, B>
  swap: () => Tuple<A, E>
  fold: <C>(f: Fold<E, A, C>) => C,
  toArray: () => [E, A],
  toString: () => string,
}

export class Tuple<E, A> implements ITuple<E, A> {
  readonly tag = 'tuple';

  constructor(readonly first: E, readonly second: A) {}

  mapFirst = <F>(fef: (e: E) => F): Tuple<F, A> => new Tuple(fef(this.first), this.second);
  mapSecond = <B>(fab: (a: A) => B): Tuple<E, B> => new Tuple(this.first, fab(this.second));
  mapBoth = <B, F>(fef: (e: E) => F, fab: (a: A) => B): Tuple<F, B> => new Tuple(fef(this.first), fab(this.second));
  swap = () => new Tuple(this.second, this.first);
  fold = <C>(f: Fold<E, A, C>) => f(this.first, this.second);
  toArray = (): [E, A] => [this.first, this.second];
  toString = () => `Tuple(${this.first}, ${this.second})`;
}