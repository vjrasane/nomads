import { just, Maybe, nothing } from './maybe';
import * as M from './maybe';
import { err, ok, Result } from './result';
import { RemoteData } from '.';

export type NotAsked = { tag: 'not asked' };

export const notAsked: RemoteData<never, never> = { tag: 'not asked' }; 

export type Loading = { tag: 'loading' };

export const loading: RemoteData<never, never> = { tag: 'loading' };

export type Failure<E> = { tag: 'failure', error: E }

export const failure = <E>(error: E): RemoteData<E, never> => ({ tag: 'failure', error });

export type Success<T> = { tag: 'success', data: T };

export const success = <A>(data: A): RemoteData<never, A> => ({ tag: 'success', data });

export type RemoteData<E, T> = NotAsked | Loading | Failure<E> | Success<T>;

/**
 * Transforms a RemoteData value with a given function 
 * 
 * @template A
 * @template B
 * @template E
 * @param {Function} fab mapper function from A to B 
 * @param {RemoteData<E, A>} ra remote data of E and A 
 * @returns {RemoteData<E, B>} remote data of E and B
 */
export const map = <A, B, E>(fab: (a: A) => B, ra: RemoteData< E, A>): RemoteData< E, B> => {
  switch (ra.tag) {
  case 'success':
    return success(fab(ra.data));
  default:
    return ra;
  }
};

export const andMap = <A, B, E>(fab: RemoteData<E, (a: A) => B>, a: RemoteData<E, A>, ): RemoteData<E, B> => {
  switch (fab.tag) {
  case 'success':
    return map(fab.data, a);
  default:
    return fab;
  }
};

export const couple = <A, B, C, E>(
  fabc: (a: A, b: B) => C,
  a: RemoteData<E, A>, b: RemoteData<E, B>): RemoteData<E, C> => {
  const curried = (_a: A) => (_b: B): C => fabc(_a, _b);
  return andMap(map(curried, a), b);
};

export const join = <A, E>(a: RemoteData<E, RemoteData<E, A>>): RemoteData<E, A> => {
  switch (a.tag) {
  case 'success':
    return a.data;
  default:
    return a;
  }
};

export const andThen = <A, B, E>(fab: (a: A) => RemoteData<E, B>, a: RemoteData<E, A>): RemoteData<E, B> => {
  switch (a.tag) {
  case 'success':
    return fab(a.data);
  default:
    return a;
  }
};

export const toMaybe = <A, E>(a: RemoteData<E, A>): Maybe<A> => {
  switch (a.tag) {
  case 'success':
    return just(a.data);
  default:
    return nothing;
  }
};

export const toResult = <A, E>(a: RemoteData<E, A>): Maybe<Result<E, A>> => {
  switch(a.tag) {
  case 'success':
    return just(ok(a.data));
  case 'failure':
    return just(err(a.error));
  default:
    return nothing;
  }
};

export const fromResult = <A, E>(a: Result<E, A>): RemoteData<E, A> => {
  switch(a.tag) {
  case 'ok':
    return success(a.value);
  case 'err':
    return failure(a.error);
  }
};

export const withDefault = <A, E>(a: RemoteData<E, A>, def: A): A => M.withDefault(def, toMaybe(a));

export const toOptional = <A, E>(a: RemoteData<E, A>): A | undefined => withDefault(a, undefined);

export const unwrap = <A, B, E>(def: B, fab: (a: A) => B, a: RemoteData<E, A>): B => M.unwrap(def, fab, toMaybe(a));