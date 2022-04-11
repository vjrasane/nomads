import { just, Maybe, nothing } from './maybe';
import * as M from './maybe';
import { Either, left, right } from './either';

export type Ok<T> = { tag: 'ok', value: T };

export const ok = <T>(value: T): Result<never, T> => ({ tag: 'ok', value });

export type Err<E> = { tag: 'err', error: E };

export const err = <E>(error: E): Result<E, never> => ({ tag: 'err', error });

export type Result<E, T> = Ok<T> | Err<E>;


export const map = <A, B, E>(fab: (a: A) => B, a: Result<E, A>): Result<E, B> => {
  switch (a.tag) {
  case 'ok':
    return ok(fab(a.value));
  default:
    return a;
  }
};

export const andThen = <A, B, E>(fab: (a: A) => Result<E, B>, a: Result<E, A>): Result<E, B> => {
  switch (a.tag) {
  case 'ok':
    return fab(a.value);
  default:
    return a;
  }
};

export const join = <A, E>(a: Result<E, Result<E, A>>): Result<E, A> => {
  switch (a.tag) {
  case 'ok':
    return a.value;
  default:
    return a;
  }
};

export const andMap = <A, B, E>(fab: Result<E, (a: A) => B>, a: Result<E, A>): Result<E, B> => {
  switch (fab.tag) {
  case 'ok':
    return map(fab.value, a);
  default:
    return fab;
  }
};

export const couple = <A, B, C, E>(
  fabc: (a: A, b: B) => C,
  qa: Result<E, A>, qb: Result<E, B>): Result<E, C> => {
  const curried = (a: A) => (b: B): C => fabc(a, b);
  return andMap(map(curried, qa), qb);
};

export const toEither = <A, E>(a: Result<E, A>): Either<E, A> => {
  switch (a.tag) {
  case 'ok':
    return right(a.value);
  case 'err':
    return left(a.error);
  }
};

export const fromEither = <A, E>(a: Either<E, A>): Result<E, A> => {
  switch (a.tag) {
  case 'left':
    return err(a.value);
  case 'right':
    return ok(a.value);
  }
};

export const toMaybe = <A, E>(a: Result<E, A>): Maybe<A> => {
  switch (a.tag) {
  case 'ok':
    return just(a.value);
  default:
    return nothing;
  }
};

export const withDefault = <A, E>(def: A, a: Result<E, A>): A => M.withDefault(def, toMaybe(a));

export const toOptional = <A, E>(a: Result<E, A>): A | undefined => withDefault(undefined, a);