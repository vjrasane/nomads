import * as I from './tuple.internal';

export class Tuple<A, B> {
  private constructor(private readonly internal: I.Tuple<A, B>) {}

  get tag(): I.Tuple<A, B>['tag'] {
    return this.internal.tag;
  }

  get tuple(): I.Tuple<A, B> {
    return this.internal;
  }

  get first(): A {
    return this.internal.first;
  }

  get second(): B {
    return this.internal.second;
  }

  private apply = <C, D>(
    f: (ra: I.Tuple<A, B>) => I.Tuple<C, D>
  ): Tuple<C, D> => new Tuple(f(this.internal));

  mapFirst = <C>(fac: (a: A) => C): Tuple<C, B> => this.apply(I.mapFirst(fac));
  mapSecond = <C>(fbc: (b: B) => C): Tuple<A, C> => this.apply(I.mapSecond(fbc));
  mapBoth = <C, D>(fac: (a: A) => C, fbd: (b: B) => D): Tuple<C, D> => this.apply(I.mapBoth(fac, fbd));
  swap = (): Tuple<B, A> => this.apply(I.swap);
  fold = <C>(fabc: (a: A, b: B) => C): C => I.fold(fabc)(this.internal);
  toString = (): string => I.toString(this.internal);

  static from = <A, B>(a: A, b: B) => new Tuple(I.Tuple(a, b));
  static fromArray = <A, B>(arr: [A, B]): Tuple<A, B> => new Tuple(I.fromArray(arr));
  static double = <A>(value: A): Tuple<A, A> => new Tuple(I.double(value));
}