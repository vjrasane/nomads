import * as I from './internal';

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
