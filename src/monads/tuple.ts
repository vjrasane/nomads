namespace I {
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

}
export class Tuple<A, B> {
  private constructor(private readonly internal: I.Tuple<A, B>) {}

  static from = <A, B>(t: I.Tuple<A, B>): Tuple<A, B> => new Tuple<A, B>(t);
  static of = <A, B>(a: A, b: B) => Tuple.from(I.Tuple(a, b));

  readonly tag = 'tuple';

  get tuple(): I.Tuple<A, B> {
    return this.internal;
  }

  get first(): A {
    return this.internal[0];
  }

  get second(): B {
    return this.internal[1];
  }

  private apply = <C, D>(f: (ra: I.Tuple<A, B>) => I.Tuple<C, D>): Tuple<C, D> => new Tuple(f(this.internal));

  mapFirst = <C>(fac: (a: A) => C): Tuple<C, B> => this.apply(I.mapFirst(fac));
  mapSecond = <C>(fbc: (b: B) => C): Tuple<A, C> => this.apply(I.mapSecond(fbc));
  mapBoth = <C, D>(fac: (a: A) => C, fbd: (b: B) => D): Tuple<C, D> => this.apply(I.mapBoth(fac, fbd));
  swap = (): Tuple<B, A> => this.apply(I.swap);
  fold = <C>(fabc: (a: A, b: B) => C): C => I.fold(fabc)(this.internal);
  toArray = (): [A, B] => this.internal;
  toString = (): string => I.toString(this.internal);

  static fromArray = <A, B>(arr: [A, B]): Tuple<A, B> => Tuple.from(arr);
  static double = <A>(value: A): Tuple<A, A> => Tuple.from(I.double(value));
}

export const from = Tuple.from;
export const of = Tuple.of;
export const fromArray = Tuple.fromArray;
export const double = Tuple.double;
