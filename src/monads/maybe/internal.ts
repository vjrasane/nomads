import { Result, Ok, Err } from '../../../result';

type Just<A> = {
  readonly tag: 'just';
  readonly value: A;
};

type Nothing = {
  readonly tag: 'nothing';
};

export type Maybe<A> = Just<A> | Nothing;

export const Just = <A>(value: A): Maybe<A> => ({ tag: 'just', value });
export const Nothing: Maybe<any> = { tag: 'nothing' };

export const toOptional = <A>(m: Maybe<A>): A | undefined => {
  switch (m.tag) {
  case 'just':
    return m.value;
  default:
    return undefined;
  }
};

export const map =
  <A, B>(fab: (a: A) => B) =>
    (m: Maybe<A>): Maybe<B> => {
      switch (m.tag) {
      case 'just':
        return Just(fab(m.value));
      default:
        return m;
      }
    };

export const filter =
  <A>(f: (a: A) => boolean) =>
    (m: Maybe<A>): Maybe<A> => {
      switch (m.tag) {
      case 'just':
        return f(m.value) ? m : Nothing;
      default:
        return m;
      }
    };

export type Fold<A, B> = {
  just: (a: A) => B,
  nothing: () => B
}

export const fold =
  <A, B>(f: Fold<A, B>) =>
    (m: Maybe<A>): B => {
      switch (m.tag) {
      case 'just':
        return f.just(m.value);
      default:
        return f.nothing();
      }
    };

export const or =
  <A>(first: Maybe<A>) =>
    (second: Maybe<A>): Maybe<A> => {
      switch (first.tag) {
      case 'just':
        return first;
      default:
        return second;
      }
    };

export const orElse =
  <A>(first: Maybe<A>) =>
    (second: Maybe<A>): Maybe<A> => {
      switch (second.tag) {
      case 'just':
        return second;
      default:
        return first;
      }
    };

export const defaultTo =
  <A>(def: A) =>
    (m: Maybe<A>): Maybe<A> => {
      switch (m.tag) {
      case 'just':
        return m;
      default:
        return Just(def);
      }
    };

export const getOrElse =
  <A>(def: A) =>
    (m: Maybe<A>): A => {
      switch (m.tag) {
      case 'just':
        return m.value;
      default:
        return def;
      }
    };

export const toResult =
  <E, A>(err: E) =>
    (m: Maybe<A>): Result<E, A> => {
      switch (m.tag) {
      case 'just':
        return Ok(m.value);
      default:
        return Err(err);
      }
    };

export const toString = <A>(m: Maybe<A>): string => {
  switch (m.tag) {
  case 'just':
    return `Just(${m.value})`;
  default:
    return 'Nothing';
  }
};

export const fromOptional = <A>(a: A | undefined): Maybe<A> => {
  switch (a) {
  case undefined:
    return Nothing;
  default:
    return Just(a);
  }
};

export const fromNullable = <A>(a: A | null | undefined): Maybe<A> => {
  switch (a) {
  case undefined:
  case null:
    return Nothing;
  default:
    return Just(a);
  }
};

export const fromNumber = (a: number): Maybe<number> => {
  if (isNaN(a)) return Nothing;
  return Just(a);
};

export const nth = <A>(index: number, arr: Array<A>): Maybe<A> => fromOptional(arr[index]);

export const first = <A>(arr: Array<A>): Maybe<A> => nth(0, arr);

export const last = <A>(arr: Array<A>): Maybe<A> => nth(arr.length - 1, arr);

export const find = <A, T extends readonly A[]>(f: (a: A) => boolean) => (arr: T): Maybe<A> => fromOptional(arr.find(f));