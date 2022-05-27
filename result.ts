import { Either, Left, Right } from './either';
import { Just, Maybe, Nothing } from './maybe';
import { NonEmptyArray } from './non-empty-array';

namespace I {

type Ok<A> = {
  readonly tag: 'ok';
  readonly value: A;
};

type Err<E> = {
  readonly tag: 'err';
  readonly error: E;
};

export type Result<E, A> = Ok<A> | Err<E>;

export const Ok = <A>(value: A): Result<any, A> => ({ tag: 'ok', value });
export const Err = <E>(error: E): Result<E, any> => ({ tag: 'err', error });

export const map =
  <E, A, B>(fab: (a: A) => B) =>
    (ra: Result<E, A>): Result<E, B> => {
      switch (ra.tag) {
      case 'ok':
        return Ok(fab(ra.value));
      default:
        return ra;
      }
    };

export const mapError =
  <E, A, B>(feb: (e: E) => B) =>
    (ra: Result<E, A>): Result<B, A> => {
      switch (ra.tag) {
      case 'ok':
        return ra;
      default:
        return Err(feb(ra.error));
      }
    };

export type Fold<E, A, B> = {
  ok: (a: A) => B,
  err: (e: E) => B
}

export const fold =
  <E, A, B>(f: Fold<E, A, B>) =>
    (ra: Result<E, A>): B => {
      switch (ra.tag) {
      case 'ok':
        return f.ok(ra.value);
      default:
        return f.err(ra.error);
      }
    };

export const or =
  <E, A>(first: Result<E, A>) =>
    (second: Result<E, A>): Result<E, A> => {
      switch (second.tag) {
      case 'ok':
        return first.tag === 'ok' ? first : second;
      default:
        return first;
      }
    };

export const orElse =
  <E, A>(first: Result<E, A>) =>
    (second: Result<E, A>): Result<E, A> =>
      or(second)(first);

export const defaultTo =
  <E, A>(def: A) =>
    (r: Result<E, A>): Result<E, A> => {
      switch (r.tag) {
      case 'ok':
        return r;
      default:
        return Ok(def);
      }
    };

export const toEither = <E, A>(r: Result<E, A>): Either<E, A> => {
  switch (r.tag) {
  case 'ok':
    return Right(r.value);
  default:
    return Left(r.error);
  }
};

export const getError = <E, A>(r: Result<E, A>): Maybe<E> => {
  switch (r.tag) {
  case 'ok':
    return Nothing;
  default:
    return Just(r.error);
  }
};

export const getOrElse =
  <E, A>(def: A) =>
    (r: Result<E, A>): A => {
      switch (r.tag) {
      case 'ok':
        return r.value;
      default:
        return def;
      }
    };

export const getValue = <E, A>(r: Result<E, A>): Maybe<A> => {
  switch (r.tag) {
  case 'ok':
    return Just(r.value);
  default:
    return Nothing;
  }
};

export const toString = <E, A>(r: Result<E, A>): string => {
  switch (r.tag) {
  case 'ok':
    return `Ok(${r.value})`;
  default:
    return `Err(${r.error})`;
  }
};

}

export interface Result<E, A> {
  result: I.Result<E, A>,
  tag: I.Result<E, A>['tag'],
  value: A | undefined,
  error: E | undefined,
  map: <B>(fab: (a: A) => B) => Result<E, B>,
  mapError: <F>(fef: (e: E) => F) => Result<F, A>,
  chain: <B>(fab: (a: A) => Result<E, B>) => Result<E, B>,
  fold: <B>(f: I.Fold<E, A, B>) => B,
  or: (ra: Result<E, A>) => Result<E, A>,
  orElse: (ra: Result<E, A>) => Result<E, A>,
  default: (a: A) => Result<E, A>,
  toEither: () => Either<E, A>,
  toMaybe: () => Maybe<A>,
  get: () => A | undefined,
  getOrElse: (def: A) => A,
  getValue: () => Maybe<A>,
  getError: () => Maybe<E>,
  toString: () => string,
}

type ResultType<R> = R extends Result<any, infer T> ? T : never;

type ErrorType<R> = R extends Result<infer T, any> ? T : never;

type ResultArray<A extends any[]> = { -readonly [P in keyof A]: Result<any, A[P]> } 

type ResultTypeConstruct<A extends readonly Result<any, any>[] | Record<string | symbol | number, Result<any, any>>> =  { -readonly [P in keyof A]: ResultType<A[P]> };

const ResultConstructor = <E, A>(result: I.Result<E, A>): Result<E, A> => ({
  result,
  tag: result.tag,
  value: I.getValue(result).value,
  error: I.getError(result).value,
  map: (fab) => map(fab, result),
  mapError: <B>(fef: (e: E) => B) => ResultConstructor(I.mapError<E, A, B>(fef)(result)),
  chain: (fab) => chain(fab, result),
  fold: (f) => I.fold(f)(result),
  or: (other) => ResultConstructor(I.or(result)(other.result)),
  orElse: (other) => ResultConstructor(I.orElse(result)(other.result)),
  default: (def) => ResultConstructor(I.defaultTo<E, A>(def)(result)),
  toEither: () => I.toEither(result),
  toMaybe: () => I.getValue(result),
  get: () => I.getValue(result).value,
  getOrElse: (def) => I.getOrElse(def)(result),
  getValue: () => I.getValue(result),
  getError: () => I.getError(result),
  toString: () => I.toString(result)
});

const map = <E, A, B>(fab: (a: A) => B, r: I.Result<E, A>): Result<E, B> => ResultConstructor(I.map<E, A, B>(fab)(r));
const chain = <E, A, B>(fab: (a: A) => Result<E, B>, r: I.Result<E, A>): Result<E, B> => {
  switch(r.tag) {
  case 'ok':
    return fab(r.value);
  default:
    return ResultConstructor(r);
  }
};

export const Ok = <A>(value: A): Result<any, A> => ResultConstructor(I.Ok(value));
export const Err = <E>(error: E): Result<E, any> => ResultConstructor(I.Err(error));

export const apply = <F extends (...args: any[]) => any, A extends Parameters<F>>(f: F, args: ResultArray<A>): Result<ErrorType<A[keyof A]>, ReturnType<F>> => {
  return Result.all(args as unknown as Result<any, any>[]) .map((args) => f(...args)) as Result<ErrorType<A[keyof A]>, ReturnType<F>>;
};

export const applyTo = <E, A, B>(r: Result<E, A>) => (f: (a: A) => B): Result<E, B> => r.map(f);

export const all = <T extends readonly Result<any, any>[] | []>(arr: T): Result<ErrorType<T[keyof T]>, ResultTypeConstruct<T>> => {
  return (arr as readonly Result<ErrorType<T[keyof T]>, any>[]).reduce(
    (acc: Result<ErrorType<T[keyof T]>, ResultTypeConstruct<T>>, curr): Result<ErrorType<T[keyof T]>, ResultTypeConstruct<T>> => acc.chain(
      a => curr.map((v) => [...(a as readonly unknown[]), v ]  as unknown as ResultTypeConstruct<T>)
    ), Ok([]));
};
    
export const some = <A extends NonEmptyArray<Result<E, any>>, E = any>(arr: A): Result<E, ResultType<A[number]>> => {
  return arr.reduce((acc, curr): Result<E, ResultType<A[number]>> => acc.or(curr));
};
    
export const values = <A extends Array<Result<any, any>>>(arr: A): Array<ResultType<A[number]>> => {
  return arr.reduce((acc: Array<ResultType<A[number]>>, curr: A[number]): Array<ResultType<A[number]>> => 
    curr.fold<Array<ResultType<A[number]>>>({
      err: () => acc,
      ok: v => [...acc, v]
    })
  , []);
};
  
export const array = all;

export const record = <R extends Record<string, Result<any, any>>>(record: R): Result<ErrorType<R[keyof R]>, ResultTypeConstruct<R>> => {
  return Object.entries(record).reduce((acc, [key, value]): Result<ErrorType<R[keyof R]>, Partial<ResultTypeConstruct<R>>> => {
    return acc.chain((a) => value.map((v) => ({ ...a, [key]: v })));
  }, Ok({})) as unknown as Result<ErrorType<R[keyof R]>, ResultTypeConstruct<R>>;
};

export const join =  <E, A>(r: Result<E, Result<E, A>>): Result<E, A> => r.chain(v => v);

export const Result = {
  Ok,
  Err,
  applyTo,
  apply,
  all,
  some,
  array,
  record,
  values,
  join
} as const;
