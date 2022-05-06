import { Just, Maybe, Nothing } from '../maybe/maybe';
import { Err, Ok, Result } from '../result/result';

interface IEither<A, B> {
  readonly mapRight: <C>(fab: (a: B) => C) => Either<A, C>
  readonly mapLeft: <C>(fab: (a: A) => C) => Either<C, B>
  readonly fold: <C>(fac: (a: A) => C, fbc: (b: B) => C) => C
  readonly swap: () => Either<B, A>,
  readonly toResult: () => Result<A, B>, 
  readonly toMaybe: () => Maybe<B>,
  readonly get: () => A | B,
  readonly getLeft: () => Maybe<A>,
  readonly getRight: () => Maybe<B>,
  readonly toString: () => string
}

export interface Left<T> extends IEither<T, any> {
  tag: 'left',
  value: T
}

export interface Right<T> extends IEither<any, T> {
  tag: 'right',
  value: T
}

export type Either<A, B> = Left<A> | Right<B>;

export const Left = <T>(value: T): Either<T, any> => ({
  tag: 'left',
  value,
  mapRight: () => Left(value),
  mapLeft: (fab) => Left(fab(value)),
  fold: (fac) => fac(value),
  swap: () => Right(value),
  toResult: () => Err(value),
  toMaybe: () => Nothing,
  get: () => value,
  getLeft: () => Just(value),
  getRight: () => Nothing,
  toString: () => `Left(${value})`
});

export const Right = <T>(value: T): Either<any, T> => ({
  tag: 'right',
  value,
  mapRight: (fab) => Right(fab(value)),
  mapLeft: () => Right(value),
  fold: (fac, fbc) => fbc(value),
  swap: () => Left(value),
  toResult: () => Ok(value),
  toMaybe: () => Just(value),
  get: () => value,
  getLeft: () => Nothing,
  getRight: () => Just(value),
  toString: () => `Right(${value})`
});

