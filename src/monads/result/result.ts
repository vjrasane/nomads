import { Either, Left, Right } from '../either/either';
import *  as M from '../maybe/maybe';
import { Just, Maybe, Nothing } from '../maybe/maybe';

interface IResult<E, A> {
	readonly map: <B>(fab: (a: A) => B) => Result<E, B>
	readonly chain: <B>(fab: (a: A) => Result<E, B>) => Result<E, B>
	readonly fold: <C>(fec: (e: E) => C, fac: (a: A) => C) => C,
	readonly toEither: () => Either<E, A>,
	readonly toMaybe: () => Maybe<A>
	readonly get: () => A | undefined,
	readonly getValue: () => Maybe<A>,
	readonly getError: () => Maybe<E>,
	readonly toString: () => string,
}

export interface Ok<T> extends IResult<any, T> {
	readonly tag: 'ok',
	readonly value: T
}

export interface Err<E> extends IResult<E, any> {
	readonly tag: 'err',
	readonly error: E
}

export type Result<E, A> = Ok<A> | Err<E>;

export const Ok = <A>(value: A): Result<any, A> => ({
  tag: 'ok',
  value,
  map: (fab) => Ok(fab(value)),
  chain: (fab) => fab(value),
  fold: (fec, fac) => fac(value), 
  toEither: () => Right(value),
  toMaybe: () => Just(value),
  get: () => value,
  getValue: () => Just(value),
  getError: () => Nothing,
  toString: () => `Ok(${value})`
});

export const Err = <E>(error: E): Result<E, any> => ({
  tag: 'err',
  error,
  map: () => Err(error),
  chain: () => Err(error),
  fold: <B>(fec: (e: E) => B): B => fec(error),
  toEither: () => Left(error),
  toMaybe: () => Nothing,
  get: () => undefined,
  getValue: () => Nothing,
  getError: () => Just(error),
  toString: () => `Err(${error})`
});

export const applyTo = <A, B, E>(a: Result<E, A>) => (f: (a: A) => B) => a.map(f);  

export const join = <A, E>(a: Result<E, Result<E, A>>): Result<E, A> => {
  switch (a.tag) {
  case 'ok':
    return a.value;
  default:
    return a;
  }
};

export const fromOptional = <A, E>(value: A | undefined, err: E): Result<E, A> => {
  return M.fromOptional(value).toResult(err);
};

export const fromNullable = <A, E>(value: A | undefined | null, err: E): Result<E, A> => {
  return M.fromNullable(value).toResult(err);
};

export const fromNumber = <E>(value: number, err: E): Result<E, number> => {
  return M.fromNumber(value).toResult(err);
};


