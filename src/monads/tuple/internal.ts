export type Tuple<A, B> = [A, B];

export const Tuple = <A, B>(a: A, b: B): Tuple<A, B> => [a, b];

export const double = <A>(a: A): Tuple<A, A> => Tuple(a, a);

export const mapFirst =
  <A, B, C>(fac: (a: A) => C) =>
    ([a, b]: Tuple<A, B>): Tuple<C, B> =>
      Tuple(fac(a), b);

export const mapSecond =
  <A, B, C>(fbc: (b: B) => C) =>
    ([a, b]: Tuple<A, B>): Tuple<A, C> =>
      Tuple(a, fbc(b));

export const mapBoth =
  <A, B, C, D>(fac: (a: A) => C, fbd: (b: B) => D) =>
    ([a, b]: Tuple<A, B>): Tuple<C, D> =>
      Tuple(fac(a), fbd(b));

export const swap = <A, B>([a, b]: Tuple<A, B>): Tuple<B, A> => Tuple(b, a);

export const fold =
  <A, B, C>(fabc: (a: A, b: B) => C) =>
    ([a, b]: Tuple<A, B>): C =>
      fabc(a ,b);

export const toString = <A, B>([a, b]: Tuple<A, B>) => `Tuple(${a}, ${b})`;
