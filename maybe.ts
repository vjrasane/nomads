import { Err, Ok, Result } from './result';

namespace I {
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
}

export interface Maybe<A> {
  readonly value: A | undefined,
  readonly tag: I.Maybe<A>['tag'],
  readonly maybe: I.Maybe<A>,
  get: () => A | undefined
  map: <B>(fab: (a: A) => B) => Maybe<B>,
  chain: <B>(fab: (a: A) => Maybe<B>) => Maybe<B>,
  or: (m: Maybe<A>) => Maybe<A>,
  orElse: (m: Maybe<A>) => Maybe<A>,
  default: (a: A) => Maybe<A>,
  filter: (f: (a: A) => boolean) => Maybe<A>,
  fold: <B>(f: I.Fold<A, B>) => B,
  getOrElse: (def: A) => A,
  toResult: <E>(err: E) => Result<E, A>,
  toString: () => string,
  concatTo: <T>(arr: Array<T | A>) => Array<T | A>,
  appendTo: <T>(arr: Array<T | A>) => Array<T | A>
}

type Optional<A> = A | undefined;

type Nullable<A> = Optional<A> | null;

type MaybeType<M> = M extends Maybe<infer T> ? T : never;

const MaybeConstructor = <A>(maybe: I.Maybe<A>): Maybe<A> => ({
  maybe,
  tag: maybe.tag,
  value: I.toOptional(maybe),
  map: (fab) => map(fab, maybe),
  chain: (fab) => chain(fab, maybe),
  filter: (f) => apply(I.filter(f), maybe),
  fold: (f) => I.fold(f)(maybe),
  or: (other) => apply(I.or(maybe), other.maybe),
  orElse: (other) => apply(I.orElse(maybe), other.maybe),
  default: (def) =>  apply(I.defaultTo(def), maybe),
  toResult: <E>(err: E) => I.toResult<E, A>(err)(maybe),
  toString: () => I.toString(maybe),
  get: () => I.toOptional(maybe),
  getOrElse: (def) => I.getOrElse(def)(maybe),
  concatTo: (arr) => map((a) => [a, ...arr], maybe).getOrElse(arr),
  appendTo: (arr) => map((a)=> [...arr, a], maybe).getOrElse(arr)
});

export const Just = <A>(v: A): Maybe<A> => MaybeConstructor(I.Just(v));

export const Nothing: Maybe<any> = MaybeConstructor(I.Nothing);

const apply = <A, B>(f: (ra: I.Maybe<A>) => I.Maybe<B>, m: I.Maybe<A>): Maybe<B> => MaybeConstructor(f(m));
const map = <A, B>(fab: (a: A) => B, m: I.Maybe<A>): Maybe<B> => apply(I.map(fab), m);
const chain = <A, B>(fab: (a: A) => Maybe<B>, m: I.Maybe<A>): Maybe<B> => {
  switch(m.tag) {
  case 'just':
    return fab(m.value);
  default:
    return MaybeConstructor(m);
  }
};

export const all = <T extends readonly Maybe<any>[] | []>(arr: T): Maybe<{ -readonly [P in keyof T]: MaybeType<T[P]> }> => {
  return (arr as readonly Maybe<any>[]).reduce(
    (acc: Maybe<{ -readonly [P in keyof T]: MaybeType<T[P]> }>, curr): Maybe<{ -readonly [P in keyof T]: MaybeType<T[P]> }> => {
      return acc.chain(
        a => curr.map((v) => [...(a as readonly unknown[]), v ] as unknown as { -readonly [P in keyof T]: MaybeType<T[P]> })
      );
    }, Just([] as unknown as { -readonly [P in keyof T]: MaybeType<T[P]> })) as Maybe<{ -readonly [P in keyof T]: MaybeType<T[P]> }>;
};

export const some = <A extends Array<Maybe<any>>>(arr: A): Maybe<MaybeType<A[number]>> => {
  return arr.reduce((acc, curr): Maybe<MaybeType<A[number]>> => 
    acc.or(curr)
  , Nothing);
};

export const values = <A extends Array<Maybe<any>>>(arr: A): Array<MaybeType<A[number]>> => {
  return arr.reduce((acc: Array<MaybeType<A[number]>>, curr: A[number]): Array<MaybeType<A[number]>> => 
    curr.fold<Array<MaybeType<A[number]>>>({
      nothing: () => acc,
      just: v => [...acc, v]
    }), []);
};

export const record = <R extends Record<string, Maybe<any>>>(record: R): Maybe<{ -readonly [P in keyof R]: MaybeType<R[P]> }> => {
  return Object.entries(record).reduce((acc, [key, value]): Maybe<Partial<{ [P in keyof R]: MaybeType<R[P]> }>> => {
    return acc.chain((a) => value.map((v) => ({ ...a, [key]: v })));
  }, Just({})) as unknown as Maybe<{ [P in keyof R]: MaybeType<R[P]> }>;
};

export const applyTo = <A, B>(m: Maybe<A>) => (f: (a: A) => B): Maybe<B> => m.map(f);

export const fromOptional = <A>(a: Optional<A>): Maybe<A> => MaybeConstructor(I.fromOptional(a));
export const fromNullable = <A>(a: Nullable<A>): Maybe<A> => MaybeConstructor(I.fromNullable(a));
export const fromNumber = (a: number): Maybe<number> => MaybeConstructor(I.fromNumber(a));
export const join = <A>(m: Maybe<Maybe<A>>): Maybe<A> => m.chain(mm => mm);
export const nth = <A>(index: number, arr: Array<A>): Maybe<A> => MaybeConstructor(I.nth(index, arr));
export const first = <A>(arr: Array<A>): Maybe<A> => MaybeConstructor(I.first(arr));
export const last = <A>(arr: Array<A>): Maybe<A> => MaybeConstructor(I.last(arr));
export const find = <A, T extends readonly A[]>(f: (a: A) => boolean, arr: T): Maybe<A> => MaybeConstructor(I.find(f)(arr));
export const parseInt = (str: string): Maybe<number> => fromNumber(Number.parseInt(`${Number(str || 'NaN')}`));
export const parseFloat = (str: string): Maybe<number> => fromNumber(Number.parseFloat(`${Number(str || 'NaN')}`));
export const array = all;

export const Maybe = {
  Just,
  Nothing,
  applyTo,
  fromOptional,
  fromNullable,
  fromNumber,
  parseInt,
  parseFloat,
  join,
  nth, 
  first,
  last,
  find,
  all,
  some,
  values,
  record,
  array,
} as const;
