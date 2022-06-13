import * as Class from "./result.class";
import { NonEmptyArray } from "./utils";
import { ErrorType, ResultConstructType, ResultType } from "./result.class";

export type Fold<E, A, B> = {
	ok: (a: A) => B,
	err: (e: E) => B
}

export type Result<E, A> = Class.Ok<E, A> | Class.Err<E, A>;

export const Ok = <A, E = any>(value: A): Result<E, A> => new Class.Ok(value);
export const Err = <E, A = any>(error: E): Result<E, A> => new Class.Err(error);

export const record = <R extends Record<string | number | symbol, Result<any, any>>>(
	record: R
  ): Result<ErrorType<R[keyof R]>, ResultConstructType<R>> => {
	return Object.entries(record).reduce(
	  (acc, [key, value]): Result<ErrorType<R[keyof R]>, ResultConstructType<R>> => {
		return acc.chain(
		  (a): Result<ErrorType<R[keyof R]>, ResultConstructType<R>> => value.map(
			(v): ResultConstructType<R> => ({ ...a, [key]: v }))
		);
	  }, Ok({} as ResultConstructType<R>)
	);
  };

  export const all = <T extends readonly Result<any, any>[] | []>(
	arr: T
  ): Result<ErrorType<T[number]>, ResultConstructType<T>> => {
	return (arr as readonly Result<any, any>[]).reduce(
	  (acc, curr): Result<ErrorType<T[number]>, ResultConstructType<T>> => acc.chain(
		(a): Result<ErrorType<T[number]>, ResultConstructType<T>> => curr.map(
		  (v): ResultConstructType<T> => [...(a as unknown as any[]), v] as unknown as ResultConstructType<T>)
	  ), Ok([] as unknown as ResultConstructType<T>)
	);
  };
  
export const array = all;

export const applyAll = <
A extends readonly Result<any, any>[] | [],
P extends any[] & ResultConstructType<A>,
F extends (...args: P) => any
>(
    f: F,
    args: A
  ): Result<ErrorType<A[number]>, ReturnType<F>> => {
  return all(args).map(
    (a): ReturnType<F> => f(...(a as Parameters<F>))
  );
};

export const some = <A extends NonEmptyArray<Result<ErrorType<A[number]>, ResultType<A[number]>>>> (arr: A): A[number] =>
	arr.reduce((acc, curr) => acc.or(curr));

export const values = <A extends Array<Result<any, any>>>(arr: A): Array<ResultType<A[number]>> => {
  return arr.reduce(
    (acc: Array<ResultType<A[number]>>, curr: A[number]): Array<ResultType<A[number]>> =>
      curr.fold<Array<ResultType<A[number]>>>({
        err: () => acc,
        ok: (v) => [...acc, v],
      }),
    []
  );
};

export const Result = {
	Ok,
	Err,
	applyAll,
	all,
	some,
	array,
	record,
	values
  } as const;
  