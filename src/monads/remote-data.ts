import { Just, Maybe, Nothing } from './maybe';
import { Result } from './result';

interface IRemoteData<E, A> {
	readonly map: <B>(fab: (a: A) => B) => RemoteData<E, B>,
	readonly chain: <B>(fab: (a: A) => RemoteData<E, B>) => RemoteData<E, B>,
	readonly toMaybe: () => Maybe<A>,
	readonly get: () => A | undefined,
	readonly getOrElse: (def: A) => A,
	readonly getData: () => Maybe<A>,
	readonly getError: () => Maybe<E>,
	readonly toString: () => string
}

export interface StandBy extends IRemoteData<any, any> {
	readonly tag: 'stand by'
}

export interface Loading extends IRemoteData<any, any> {
	readonly tag: 'loading'
}

export interface Success<T> extends IRemoteData<any, T> {
	readonly tag: 'success',
	readonly data: T
}

export interface Failure<E> extends IRemoteData<E, any> {
	readonly tag: 'failure',
	readonly error: E
}

export const StandBy: RemoteData<any, any> = ({
  tag: 'stand by',
  map: () => StandBy,
  chain: () => StandBy,
  toMaybe: () => Nothing,
  get: () => undefined,
  getOrElse: (def) => def,
  getData: () => Nothing,
  getError: () => Nothing,
  toString: () => 'StandBy'
});

export const Loading: RemoteData<any, any> = ({
  tag: 'loading',
  map: () => Loading,
  chain: () => Loading,
  toMaybe: () => Nothing,
  get: () => undefined,
  getOrElse: (def) => def,
  getData: () => Nothing,
  getError: () => Nothing,
  toString: () => 'Loading'
});

export const Success = <A>(data: A): RemoteData<any, A> => ({
  tag: 'success',
  data,
  map: (fab) => Success(fab(data)),
  chain: (fab) => fab(data),
  toMaybe: () => Nothing,
  get: () => data,
  getOrElse: () => data,
  getData: () => Just(data),
  getError: () => Nothing,
  toString: () => `Success(${data})`
});

export const Failure = <E>(error: E): RemoteData<E, any> => ({
  tag: 'failure',
  error,
  map: () => Failure(error),
  chain: () => Failure(error),
  toMaybe: () => Nothing,
  get: () => undefined,
  getOrElse: (def) => def,
  getData: () => Nothing,
  getError: () => Just(error),
  toString: () => `Failure(${error})`
});

export type RemoteData<E, T> = StandBy | Loading | Failure<E> | Success<T>;

export const applyTo = <A, B, E>(a: RemoteData<E, A>) => (f: (a: A) => B) => a.map(f);

export const join = <A, E>(a: RemoteData<E, RemoteData<E, A>>): RemoteData<E, A> => {
  switch (a.tag) {
  case 'success':
    return a.data;
  default:
    return a;
  }
};

export const fromResult = <A, E>(a: Result<E, A>): RemoteData<E, A> => {
  return a.fold<RemoteData<E, A>>(Failure, Success);
};
