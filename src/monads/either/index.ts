import { Result } from '../result';
import { Maybe } from '../maybe';
import { Tuple } from '../tuple';
import * as I from './internal';

export class Either<A, B> {
  constructor(private readonly internal: I.Either<A, B>) {}

  static from = <A, B>(e: I.Either<A, B>) => new Either(e);
  static Left = <A>(value: A): Either<A, any> => Either.from(I.Left(value));
  static Right = <A>(value: A): Either<any, A> => Either.from(I.Right(value));

  get tag(): I.Either<A, B>['tag'] {
    return this.internal.tag;
  }

  get value(): A | B {
    return this.internal.value;
  }

  get either(): I.Either<A, B> {
    return this.internal;
  }

  private apply = <C, D>(f: (ra: I.Either<A, B>) => I.Either<C, D>): Either<C, D> => Either.from(f(this.internal));

  mapRight = <C>(fbc: (b: B) => C): Either<A, C> => this.apply(I.mapRight(fbc));
  mapLeft = <C>(fac: (a: A) => C): Either<C, B> => this.apply(I.mapLeft(fac));
  mapBoth = <C, D>(fac: (a: A) => C, fbd: (b: B) => D): Either<C, D> => this.apply(I.mapBoth(fac, fbd));
  swap = (): Either<B, A> => this.apply(I.swap);
  fold = <C>(f: I.Fold<A, B, C>): C => I.fold(f)(this.internal);
  toResult = (): Result<A, B> => I.toResult(this.internal);
  toTuple = (): Tuple<Maybe<A>, Maybe<B>> => I.toTuple(this.internal);
  get = (): A | B => this.value;
  getLeft = (): Maybe<A> => I.getLeft(this.internal);
  getRight = (): Maybe<B> => I.getRight(this.internal);
  toString = (): string => I.toString(this.internal);
}

export const from = Either.from;
export const Left = Either.Left;
export const Right = Either.Right;
