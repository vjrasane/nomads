import { Err, Ok, Result } from './result';
import { Just, Maybe, Nothing } from './maybe';
import { Tuple } from './tuple';

namespace I {

type Left<A> = {
  readonly tag: 'left';
  readonly value: A;
};

type Right<A> = {
  readonly tag: 'right';
  readonly value: A;
};

export type Either<A, B> = Left<A> | Right<B>;

export const Right = <A>(value: A): Either<any, A> => ({ tag: 'right', value });
export const Left = <A>(value: A): Either<A, any> => ({ tag: 'left', value });

export const mapRight =
  <A, B, C>(fbc: (a: B) => C) =>
    (e: Either<A, B>): Either<A, C> => {
      switch (e.tag) {
      case 'right':
        return Right(fbc(e.value));
      default:
        return e;
      }
    };

export const mapLeft =
  <A, B, C>(fac: (a: A) => C) =>
    (e: Either<A, B>): Either<C, B> => {
      switch (e.tag) {
      case 'right':
        return e;
      default:
        return Left(fac(e.value));
      }
    };

export const mapBoth = 
    <A, B, C, D>(fac: (a: A) => C, fbd: (b: B) => D) => (e: Either<A, B>): Either<C, D> => {
    switch(e.tag) {
    case 'left':
      return Left(fac(e.value));
    default:
      return Right(fbd(e.value));  
    }
  };

export type Fold<A, B, C> = {
  left: (a: A) => C,
  right: (b: B) => C
}

export const fold =
  <A, B, C>(f: Fold<A, B, C>) =>
    (e: Either<A, B>): C => {
      switch (e.tag) {
      case 'left':
        return f.left(e.value);
      default:
        return f.right(e.value);
      }
    };

export const swap = <A, B>(e: Either<A, B>): Either<B, A> => {
  switch (e.tag) {
  case 'right':
    return Left(e.value);
  default:
    return Right(e.value);
  }
};

export const getLeft = <A, B>(e: Either<A, B>): Maybe<A> => {
  switch (e.tag) {
  case 'left':
    return Just(e.value);
  case 'right':
    return Nothing;
  }
};

export const getRight = <A, B>(e: Either<A, B>): Maybe<B> => {
  switch (e.tag) {
  case 'right':
    return Just(e.value);
  default:
    return Nothing;
  }
};

export const toString = <A, B>(e: Either<A, B>): string => {
  switch (e.tag) {
  case 'right':
    return `Right(${e.value})`;
  default:
    return `Left(${e.value})`;
  }
};

export const toResult = <A, B>(e: Either<A, B>): Result<A, B> => {
  switch (e.tag) {
  case 'right':
    return Ok(e.value);
  default:
    return Err(e.value);
  }
};


export const toTuple = <A, B>(e: Either<A, B>): Tuple<Maybe<A>, Maybe<B>> => {
  return Tuple.of(getLeft(e), getRight(e));
};

}

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
