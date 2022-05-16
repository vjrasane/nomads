export type Tuple<A, B> = {
  readonly tag: 'tuple';
  readonly first: A;
  readonly second: B;
};

export const Tuple = <A, B>(first: A, second: B): Tuple<A, B> => ({ tag: 'tuple', first, second });

export const toArray = <A, B>(t: Tuple<A, B>): [A, B] => [t.first, t.second];

export const double = <A>(a: A): Tuple<A, A> => Tuple(a, a);

export const fromArray = <A, B>([a, b]: [A, B]): Tuple<A, B> => Tuple(a, b);

export const mapFirst =
  <A, B, C>(fac: (a: A) => C) =>
    (t: Tuple<A, B>): Tuple<C, B> =>
      Tuple(fac(t.first), t.second);

export const mapSecond =
  <A, B, C>(fbc: (b: B) => C) =>
    (t: Tuple<A, B>): Tuple<A, C> =>
      Tuple(t.first, fbc(t.second));

export const mapBoth =
  <A, B, C, D>(fac: (a: A) => C, fbd: (b: B) => D) =>
    (t: Tuple<A, B>): Tuple<C, D> =>
      Tuple(fac(t.first), fbd(t.second));

export const swap = <A, B>(t: Tuple<A, B>): Tuple<B, A> => Tuple(t.second, t.first);

export const fold =
  <A, B, C>(fabc: (a: A, b: B) => C) =>
    (t: Tuple<A, B>): C =>
      fabc(t.first, t.second);

export const toString = <A, B>(t: Tuple<A, B>) => `Tuple(${t.first}, ${t.second})`;
