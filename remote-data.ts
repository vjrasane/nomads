import { Just, Maybe, Nothing } from './maybe';
import { NonEmptyArray } from './non-empty-array';
import { Result } from './result';

namespace I {

type StandBy = { readonly tag: 'stand by' };

type Loading = { readonly tag: 'loading' };

type Success<T> = {
  readonly tag: 'success';
  readonly data: T;
};

type Failure<E> = {
  readonly tag: 'failure';
  readonly error: E;
};

export type RemoteData<E, A> = StandBy | Loading | Success<A> | Failure<E>;

export const StandBy: RemoteData<any, any> = { tag: 'stand by' };

export const Loading: RemoteData<any, any> = { tag: 'loading' };

export const Success = <A>(data: A): RemoteData<any, A> => ({ tag: 'success', data });

export const Failure = <E>(error: E): RemoteData<E, any> => ({ tag: 'failure', error });

export const map =
  <E, A, B>(fab: (a: A) => B) =>
    (r: RemoteData<E, A>): RemoteData<E, B> => {
      switch (r.tag) {
      case 'success':
        return Success(fab(r.data));
      default:
        return r;
      }
    };

export const mapError =
  <E, A, B>(feb: (e: E) => B) =>
    (r: RemoteData<E, A>): RemoteData<B, A> => {
      switch (r.tag) {
      case 'failure':
        return Failure(feb(r.error));
      default:
        return r;
      }
    };

export const getData = <E, A>(r: RemoteData<E, A>): Maybe<A> => {
  switch (r.tag) {
  case 'success':
    return Just(r.data);
  default:
    return Nothing;
  }
};

export const getError = <E, A>(r: RemoteData<E, A>): Maybe<E> => {
  switch (r.tag) {
  case 'failure':
    return Just(r.error);
  default:
    return Nothing;
  }
};

export const getOrElse =
  <E, A>(def: A) =>
    (r: RemoteData<E, A>): A => {
      switch (r.tag) {
      case 'success':
        return r.data;
      default:
        return def;
      }
    };

export const defaultTo =
  <E, A>(def: A) =>
    (r: RemoteData<E, A>): RemoteData<E, A> => {
      switch (r.tag) {
      case 'success':
        return r;
      default:
        return Success(def);
      }
    };

export type Fold<E, A, B> = {
  success: (a: A) => B,
  loading: () => B,
  'stand by': () => B,
  failure: (e: E) => B
}

export const fold = <E, A, B>(f: Fold<E, A, B>) => (r: RemoteData<E, A>): B => {
  switch(r.tag) {
  case 'success':
    return f.success(r.data);
  case 'failure':
    return f.failure(r.error);
  case 'stand by':
    return f['stand by']();
  default:
    return f.loading();
  }
};

export const or =
    <E, A>(first: RemoteData<E, A>) =>
    (second: RemoteData<E, A>): RemoteData<E, A> => {
      switch (second.tag) {
      case 'success':
        return first.tag === 'success' ? first : second;
      default:
        return first;
      }
    };
  
export const orElse =
    <E, A>(first: RemoteData<E, A>) =>
    (second: RemoteData<E, A>): RemoteData<E, A> =>
      or(second)(first);

export const toString = <E, A>(r: RemoteData<E, A>): string => {
  switch (r.tag) {
  case 'stand by':
    return 'StandBy';
  case 'loading':
    return 'Loading';
  case 'success':
    return `Success(${r.data})`;
  default:
    return `Failure(${r.error})`;
  }
};

}


export interface RemoteData<E, A> {
  remoteData: I.RemoteData<E, A>,
  tag: I.RemoteData<E, A>['tag'],
  data: A | undefined,
  error: E | undefined,
  map: <B>(fab: (a: A) => B) => RemoteData<E, B>,
  mapError: <F>(fef: (e: E) => F) => RemoteData<F, A>,
  chain: <B>(fab: (a: A) => RemoteData<E, B>) => RemoteData<E, B>,
  fold: <B>(f: I.Fold<E, A, B>) => B,
  or: (ra: RemoteData<E, A>) => RemoteData<E, A>,
  orElse: (ra: RemoteData<E, A>) => RemoteData<E, A>,
  default: (a: A) => RemoteData<E, A>,
  toMaybe: () => Maybe<A>,
  get: () => A | undefined,
  getOrElse: (def: A) => A,
  getData: () => Maybe<A>,
  getError: () => Maybe<E>,
  toString: () => string,
}


type RemoteDataType<R> = R extends RemoteData<any, infer T> ? T : never;

type ErrorType<R> = R extends RemoteData<infer T, any> ? T : never;

type RemoteDataTypeConstruct<A extends readonly RemoteData<any, any>[] | Record<string | symbol | number, RemoteData<any, any>>> =  { -readonly [P in keyof A]: RemoteDataType<A[P]> };

const RemoteDataConstructor = <E, A>(remoteData: I.RemoteData<E, A>): RemoteData<E, A> => ({
  remoteData,
  tag: remoteData.tag,
  data: I.getData(remoteData).value,
  error: I.getError(remoteData).value,
  map: (fab) => map(fab, remoteData),
  mapError: <B>(fef: (e: E) => B) => RemoteDataConstructor(I.mapError<E, A, B>(fef)(remoteData)),
  chain: (fab) => chain(fab, remoteData),
  fold: (f) => I.fold(f)(remoteData),
  or: (other) => RemoteDataConstructor(I.or(remoteData)(other.remoteData)),
  orElse: (other) => RemoteDataConstructor(I.orElse(remoteData)(other.remoteData)),
  default: (def) => RemoteDataConstructor(I.defaultTo<E, A>(def)(remoteData)),
  toMaybe: () => I.getData(remoteData),
  get: () => I.getData(remoteData).value,
  getOrElse: (def) => I.getOrElse(def)(remoteData),
  getData: () => I.getData(remoteData),
  getError: () => I.getError(remoteData),
  toString: () => I.toString(remoteData)
});

const map = <E, A, B>(fab: (a: A) => B, r: I.RemoteData<E, A>): RemoteData<E, B> => RemoteDataConstructor(I.map<E, A, B>(fab)(r));
const chain = <E, A, B>(fab: (a: A) => RemoteData<E, B>, r: I.RemoteData<E, A>): RemoteData<E, B> => {
  switch(r.tag) {
  case 'success':
    return fab(r.data);
  default:
    return RemoteDataConstructor(r);
  }
};

export const Success = <A>(value: A): RemoteData<any, A> => RemoteDataConstructor(I.Success(value));
export const Failure = <E>(error: E): RemoteData<E, any> => RemoteDataConstructor(I.Failure(error));
export const Loading: RemoteData<any, any> = RemoteDataConstructor(I.Loading);
export const StandBy: RemoteData<any, any> = RemoteDataConstructor(I.StandBy);

export const apply = <A extends readonly RemoteData<any, any>[] | [], P extends any[] & RemoteDataTypeConstruct<A>, F extends (...args: P) => any>(f: F, args: A): RemoteData<ErrorType<A[keyof A]>, ReturnType<F>> => {
  return RemoteData.all(args).map((args) => f(...args as Parameters<F>)) as RemoteData<ErrorType<A[keyof A]>, ReturnType<F>>;
};

export const applyTo = <E, A, B>(r: RemoteData<E, A>) => (f: (a: A) => B): RemoteData<E, B> => r.map(f);


export const join = <E, A>(r: RemoteData<E, RemoteData<E, A>>): RemoteData<E, A> => r.chain(v => v);

export const all = <T extends readonly RemoteData<any, any>[] | []>(arr: T): RemoteData<ErrorType<T[keyof T]>, RemoteDataTypeConstruct<T>> => {
  return (arr as readonly RemoteData<ErrorType<T[keyof T]>, any>[]).reduce(
    (acc: RemoteData<ErrorType<T[keyof T]>, RemoteDataTypeConstruct<T>>, curr): RemoteData<ErrorType<T[keyof T]>, RemoteDataTypeConstruct<T>> => acc.chain(
      a => curr.map((v) => [...(a as readonly unknown[]), v ]  as unknown as RemoteDataTypeConstruct<T>)
    ), Success([]));
};
export const some = <A extends NonEmptyArray<RemoteData<E, any>>, E = any>(arr: A): RemoteData<E, RemoteDataType<A[number]>> => {
  return arr.reduce((acc, curr): RemoteData<E, RemoteDataType<A[number]>> => acc.or(curr));
};
    
export const values = <A extends Array<RemoteData<E, any>>, E = any>(arr: A): Array<RemoteDataType<A[number]>> => {
  return arr.reduce((acc: Array<RemoteDataType<A[number]>>, curr: A[number]): Array<RemoteDataType<A[number]>> => 
    curr.fold<Array<RemoteDataType<A[number]>>>(
      {
        'stand by': () => acc,
        loading: () => acc,
        failure: () => acc,
        success: (v) => [...acc, v]
      }
    )
  , []);
};

export const array = all;

export const record = <R extends Record<string, RemoteData<any, any>>>(record: R): RemoteData<ErrorType<R[keyof R]>, RemoteDataTypeConstruct<R>> => {
  return Object.entries(record).reduce((acc, [key, value]): RemoteData<ErrorType<R[keyof R]>, Partial<RemoteDataTypeConstruct<R>>> => {
    return acc.chain((a) => value.map((v) => ({ ...a, [key]: v })));
  }, Success({})) as unknown as RemoteData<ErrorType<R[keyof R]>, RemoteDataTypeConstruct<R>>;
};

export const fromResult = <E, A>(r: Result<E, A>): RemoteData<E, A> => r.fold({
  err: Failure,
  ok: Success
});

export const RemoteData = {
  Success,
  Failure,
  StandBy,
  Loading,
  applyTo,
  apply,
  all,
  some,
  array,
  record,
  values,
  join,
  fromResult
} as const;
