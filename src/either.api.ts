import * as Class from "./either.class";
import { NonEmptyArray } from "./utils";
import { LeftType, EitherConstructType, EitherType } from "./either.class";

export type Fold<E, A, B> = {
	right: (a: A) => B,
	left: (e: E) => B
}

export type Either<E, A> = Class.Right<E, A> | Class.Left<E, A>;

export const Right = <A, E = any>(value: A): Either<E, A> => new Class.Right(value);
export const Left = <E, A = any>(value: E): Either<E, A> => new Class.Left(value);

export const record = <R extends Record<string | number | symbol, Either<any, any>>>(
	record: R
  ): Either<LeftType<R[keyof R]>, EitherConstructType<R>> => {
	return Object.entries(record).reduce(
	  (acc, [key, value]): Either<LeftType<R[keyof R]>, EitherConstructType<R>> => {
		return acc.chain(
		  (a): Either<LeftType<R[keyof R]>, EitherConstructType<R>> => value.map(
			(v): EitherConstructType<R> => ({ ...a, [key]: v }))
		);
	  }, Right({} as EitherConstructType<R>)
	);
  };

export const all = <T extends readonly Either<any, any>[] | []>(
	arr: T
	): Either<LeftType<T[number]>, EitherConstructType<T>> => {
	return (arr as readonly Either<any, any>[]).reduce(
		(acc, curr): Either<LeftType<T[number]>, EitherConstructType<T>> => acc.chain(
		(a): Either<LeftType<T[number]>, EitherConstructType<T>> => curr.map(
			(v): EitherConstructType<T> => [...(a as unknown as any[]), v] as unknown as EitherConstructType<T>)
		), Right([] as unknown as EitherConstructType<T>)
	);
};
  
export const array = all;

export const applyAll = <
A extends readonly Either<any, any>[] | [],
P extends any[] & EitherConstructType<A>,
F extends (...args: P) => any
>(
    f: F,
    args: A
  ): Either<LeftType<A[number]>, ReturnType<F>> => {
  return all(args).map(
    (a): ReturnType<F> => f(...(a as Parameters<F>))
  );
};

export const some = <A extends NonEmptyArray<Either<LeftType<A[number]>, EitherType<A[number]>>>> (arr: A): A[number] =>
	arr.reduce((acc, curr) => acc.or(curr));

export const values = <A extends Array<Either<any, any>>>(arr: A): Array<EitherType<A[number]>> => {
  return arr.reduce(
    (acc: Array<EitherType<A[number]>>, curr: A[number]): Array<EitherType<A[number]>> =>
      curr.fold<Array<EitherType<A[number]>>>({
        left: () => acc,
        right: (v) => [...acc, v],
      }),
    []
  );
};

export const Either = {
	Left,
	Right,
	applyAll,
	all,
	some,
	array,
	record,
	values
  } as const;
  