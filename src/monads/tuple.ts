
export interface Tuple<A, B> {
  tag: 'tuple'
  first: A,
  second: B,
  toArray: () => [A, B],
  mapFirst: <C>(fac: (a: A) => C) => Tuple<C, B>
  mapSecond: <C>(fbc: (b: B) => C) => Tuple<A, C>,
  mapBoth: <C, D>(fac: (a: A) => C, fbd: (b: B) => D) => Tuple<C, D>,
  swap: () => Tuple<B, A>,
  toString: () => string,
}

export const Tuple = <A, B>(first: A, second: B): Tuple<A, B> => ({
  tag: 'tuple',
  first,
  second,
  toArray: () => [first, second],
  mapFirst: (fac) => Tuple(fac(first), second),
  mapSecond: (fbc) => Tuple(first, fbc(second)),
  mapBoth: (fac, fbd) => Tuple(fac(first), fbd(second)),
  swap: () => Tuple(second, first),
  toString: () => `Tuple(${first}, ${second})`
});

export const fromArray = <A, B>([a, b]: [A, B]): Tuple<A, B> => Tuple(a, b);

export const double = <A>(a: A): Tuple<A, A> => Tuple(a,a);