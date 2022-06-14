import * as Class from './remote-data.class';
import { ErrorType, RemoteDataConstructType, RemoteDataType } from './remote-data.class';
import { NonEmptyArray } from './utils';
import Result from '../result';

export type Fold<E, A, B> = {
success: (a: A) => B,
failure: (e: E) => B,
loading: () => B
} &
({ 'not asked': () => B }
| { notAsked: () => B })

export type RemoteData<E, A> = Class.NotAsked<E, A> | Class.Loading<E, A> | Class.Success<E, A> | Class.Failure<E, A>;

export const Success = <A, E = any>(value: A): RemoteData<E, A> => new Class.Success(value);
export const Failure = <E, A = any>(error: E): RemoteData<E, A> => new Class.Failure(error);
export const Loading = <E = any, A = any>(): RemoteData<E, A> => new Class.Loading();
export const NotAsked = <E = any, A = any>(): RemoteData<E, A> => new Class.NotAsked();

export const record = <R extends Record<string | number | symbol, RemoteData<any, any>>>(
  record: R
): RemoteData<ErrorType<R[keyof R]>, RemoteDataConstructType<R>> => {
  return Object.entries(record).reduce(
    (acc, [key, value]): RemoteData<ErrorType<R[keyof R]>, RemoteDataConstructType<R>> => {
      return acc.chain(
        (a): RemoteData<ErrorType<R[keyof R]>, RemoteDataConstructType<R>> => value.map(
          (v): RemoteDataConstructType<R> => ({ ...a, [key]: v }))
      );
    }, Success({} as RemoteDataConstructType<R>)
  );
};

export const all = <T extends readonly RemoteData<any, any>[] | []>(
  arr: T
): RemoteData<ErrorType<T[number]>, RemoteDataConstructType<T>> => {
  return (arr as readonly RemoteData<any, any>[]).reduce(
    (acc, curr): RemoteData<ErrorType<T[number]>, RemoteDataConstructType<T>> => acc.chain(
      (a): RemoteData<ErrorType<T[number]>, RemoteDataConstructType<T>> => curr.map(
        (v): RemoteDataConstructType<T> => [...(a as unknown as any[]), v] as unknown as RemoteDataConstructType<T>)
    ), Success([] as unknown as RemoteDataConstructType<T>)
  );
};

export const array = all;

export const applyAll = <
A extends readonly RemoteData<any, any>[] | [],
P extends any[] & RemoteDataConstructType<A>,
F extends (...args: P) => any
>(
    f: F,
    args: A
  ): RemoteData<ErrorType<A[number]>, ReturnType<F>> => {
  return all(args).map(
    (a): ReturnType<F> => f(...(a as Parameters<F>))
  );
};

export const some = <A extends NonEmptyArray<RemoteData<ErrorType<A[number]>, RemoteDataType<A[number]>>>> (arr: A): A[number] =>
  arr.reduce((acc, curr) => acc.or(curr));

export const values = <A extends Array<RemoteData<any, any>>>(arr: A): Array<RemoteDataType<A[number]>> => {
  return arr.reduce(
    (acc: Array<RemoteDataType<A[number]>>, curr: A[number]): Array<RemoteDataType<A[number]>> =>
      curr.fold<Array<RemoteDataType<A[number]>>>(      {
        notAsked: () => acc,
        loading: () => acc,
        failure: () => acc,
        success: (v) => [...acc, v]
      }),
    []
  );
};

export const fromResult = <E, A>(r: Result<E, A>): RemoteData<E, A> => r.fold({
  err: Failure,
  ok: Success
});

export const RemoteData = {
  Success,
  Failure,
  Loading,
  NotAsked,
  applyAll,
  all,
  some,
  array,
  record,
  values,
  fromResult
} as const;
