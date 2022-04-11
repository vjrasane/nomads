import { just, Maybe, nothing } from './maybe';

export type Left<T> = { tag: 'left', value: T };

export const left = <T>(value: T): Either<T, never> => ({ tag: 'left', value });

export type Right<T> = { tag: 'right', value: T };

export const right = <T>(value: T): Either<never, T> => ({ tag: 'right', value });

export type Either<A, B> = Left<A> | Right<B>;

export const swap = <A, B>(a: Either<A, B>): Either<B, A> => {
  switch(a.tag) {
  case 'right':
    return left(a.value);
  case 'left':
    return right(a.value);
  }
};

export const map = <A, B, C>(fab: (a: A) => B, a: Either<C, A>): Either<C, B> => {
  switch (a.tag) {
  case 'right':
    return right(fab(a.value));
  default:
    return a;
  }
};

export const mapLeft = <A, B, C>(fab: (a: A) => B, a: Either<A, C>): Either<B, C> => {
  switch (a.tag) {
  case 'left':
    return left(fab(a.value));
  default:
    return a;
  }
};

export const fold = <A, B, C>(fac: (a: A) => C, fbc: (b: B) => C, e: Either<A, B>): C => {
  switch (e.tag) {
  case 'left':
    return fac(e.value);
  case 'right':
    return fbc(e.value);
  }
};

export const andThen = <A, B, C>(fab: (a: A) => Either<C, B>, a: Either<C, A>): Either<C, B> => {
  switch (a.tag) {
  case 'right':
    return fab(a.value);
  default:
    return a;
  }
};

export const join = <A, B>(a: Either<A, Either<A, B>>): Either<A, B> => {
  switch (a.tag) {
  case 'right':
    return a.value;
  default:
    return a;
  }
};

export const andMap = <A, B, C>(fab: Either<C, (a: A) => B>, a: Either<C, A>): Either<C, B> => {
  switch (fab.tag) {
  case 'right':
    return map(fab.value, a);
  default:
    return fab;
  }
};

export const couple = <A, B, C, D>(
  fabc: (a: A, b: B) => C,
  qa: Either<D, A>, qb: Either<D, B>): Either<D, C> => {
  const curried = (a: A) => (b: B): C => fabc(a, b);
  return andMap(map(curried, qa), qb);
};

export const toMaybe = <A, B>(a: Either<B, A>): Maybe<A> => {
  switch (a.tag) {
  case 'right':
    return just(a.value);
  default:
    return nothing;
  }
};
