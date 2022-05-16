import { Maybe, Just, Nothing } from '../../../maybe';
import { Result, Ok, Err } from '../../../result';
import { Tuple } from '../tuple';

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
