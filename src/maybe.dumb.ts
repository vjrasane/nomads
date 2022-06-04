import { isNonNullable, isNonOptional, NonOptional, Optional } from './optional';
import { Err, Ok, Result } from '../result';
import { isType } from './type';
import { curry, FunctionInputType, FunctionOutputType } from './function';

const Brand: unique symbol = Symbol('Maybe');

export type Fold<A, B> = {
  just: (a: A) => B;
  nothing: () => B;
};

type IMaybe<A> = {
  [Brand]: typeof Brand,
  get: () => Optional<A>;
  map: <B>(fab: (a: A) => B) => Maybe<B>;
  chain: <B>(fab: (a: A) => Maybe<B>) => Maybe<B>;
  apply: (v: Maybe<FunctionInputType<A>>) => Maybe<FunctionOutputType<A>>;
  // join: () => NestedMaybeType<A>,
  // or: (m: Maybe<A>) => Maybe<A>;
  // orElse: (m: Maybe<A>) => Maybe<A>;
  // default: (a: A) => Maybe<A>;
  // filter: (f: (a: A) => boolean) => Maybe<A>;
  // fold: <B>(f: Fold<A, B>) => B;
  // getOrElse: (def: A) => A;
  // toResult: <E>(err: E) => Result<E, A>;
  // toString: () => string;
  // concatTo: <T>(arr: Array<T | A>) => Array<T | A>;
  // appendTo: <T>(arr: Array<T | A>) => Array<T | A>;
}


export type Just<A> = IMaybe<A> & {
  readonly tag: 'just';
  readonly value: A;
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export type Nothing<A> =  IMaybe<A> & {
  readonly tag: 'nothing';
}

export type Maybe<A> = Just<A> | Nothing<A>;

const toOptional = <A>(m: Maybe<A>): Optional<A> => {
  switch (m.tag) {
  case 'just':
    return m.value;
  default:
    return undefined;
  }
};

const map =
  <A, B>(fab: (a: A) => B, m: Maybe<A>): Maybe<B> => {
    switch (m.tag) {
    case 'just':
      return Just(fab(m.value));
    default:
      return m;
    }
  };

const chain = <A, B>(fab: (a: A) => Maybe<B>, m: Maybe<A>): Maybe<B> => {
  switch (m.tag) {
  case 'just':
    return fab(m.value);
  default:
    return m;
  }
};

const filter =
  <A>(f: (a: A) => boolean, m: Maybe<A>): Maybe<A> => {
    switch (m.tag) {
    case 'just':
      return f(m.value) ? m : Nothing();
    default:
      return m;
    }
  };

const fold =
  <A, B>(f: Fold<A, B>, m: Maybe<A>): B => {
    switch (m.tag) {
    case 'just':
      return f.just(m.value);
    default:
      return f.nothing();
    }
  };

const or =
  <A>(first: Maybe<A>, second: Maybe<A>): Maybe<A> => {
    switch (first.tag) {
    case 'just':
      return first;
    default:
      return second;
    }
  };

const orElse =
  <A>(first: Maybe<A>, second: Maybe<A>): Maybe<A> => or(second, first);

const defaultTo =
  <A>(def: A, m: Maybe<A>): Maybe<A> => {
    switch (m.tag) {
    case 'just':
      return m;
    default:
      return Just(def);
    }
  };

const getOrElse =
  <A>(def: A, m: Maybe<A>): A => {
    switch (m.tag) {
    case 'just':
      return m.value;
    default:
      return def;
    }
  };

const toResult =
  <E, A>(err: E, m: Maybe<A>): Result<E, A> => {
    switch (m.tag) {
    case 'just':
      return Ok(m.value);
    default:
      return Err(err);
    }
  };

const toString = <A>(m: Maybe<A>): string => {
  switch (m.tag) {
  case 'just':
    return `Just(${m.value})`;
  default:
    return 'Nothing';
  }
};

const concatTo = <A, T>(arr: Array<A | T>, m: Maybe<A>): Array<A | T> => getOrElse(arr, map((v) => [v, ...arr], m));
const appendTo = <A, T>(arr: Array<A | T>, m: Maybe<A>): Array<A | T> => getOrElse(arr, map((v) => [...arr, v], m));

const apply =
<A>(ma: Maybe<FunctionInputType<A>>, mf: Maybe<A>): Maybe<FunctionOutputType<A>> =>
    chain(
      (f) => map(
        (a) => typeof f === 'function'
          ? curry(f as unknown as (...args: any[]) => any)(a)
          : a,
        ma),
      mf);

const join =
<A>(m: Maybe<A>): NestedMaybeType<A> => {
  return Constructor(chain(
    (mm) => {
      if (isType<Maybe<any>>(Brand, mm)) return mm;
      return just(mm);
    },
    m)) as unknown as NestedMaybeType<A>;
};

// export type Maybe<A> = (Base<A>) & IMaybe<A>;

export type MaybeType<M> = M extends Just<infer T>
  ? T : M extends Nothing<infer T>
  ? T : never;

export type MaybeConstructType<
  A extends readonly Maybe<any>[] | Record<string | symbol | number, Maybe<any>>
> = { -readonly [P in keyof A]: MaybeType<A[P]> };

export type NestedMaybeType<M> = M extends Maybe<infer T> ? Maybe<T> : never;

const Constructor = <A>(base: { tag: 'nothing' } | { tag: 'just', value: A }): Maybe<A> =>{
  const maybe: Maybe<A> = {
    [Brand]: Brand,
    ...base,
    get: () => toOptional(maybe),
    map: <B>(fab: (a: A) => B) => map(fab, maybe),
    chain: <B>(fab: (a: A) => Maybe<B>) => chain(fab, maybe),
    apply: (v) => apply(v, maybe),
    // join: () => join(base),
    // filter: (f) => Constructor(filter(f, base)),
    // fold: <B>(f: Fold<A, B>): B => fold(f, base),
    // or: (other) => Constructor(or(base, other)),
    // orElse: (other) => Constructor(orElse(base, other)),
    // default: (def) => Constructor(defaultTo(def, base)),
    // toResult: <E>(err: E) => toResult<E, A>(err, base),
    // toString: () => toString(base),

  // getOrElse: (def) => getOrElse(def, base),
  // concatTo: <T>(arr: Array<A | T>) => concatTo<A, T>(arr, Constructor(base)),
  // appendTo: <T>(arr: Array<A | T>) => appendTo<A, T>(arr, Constructor(base))
  };
  return maybe;
};

const just = <A>(value: A) => ({ tag: 'just', value } as const);
const nothing = { tag: 'nothing' } as const;

export const Just = <A>(value: A): Maybe<A> => Constructor(just(value));
export const Nothing = <A = any>(): Maybe<A> => Constructor<A>(nothing);

export const fromOptional = <A>(a: A | undefined): Maybe<NonOptional<A>> => {
  if (isNonOptional(a)) return Just(a);
  return Nothing();
};

export const fromNullable = <A>(
  a: A | null | undefined
): Maybe<NonNullable<A>> => {
  if (isNonNullable(a)) return Just(a);
  return Nothing();
};

export const fromNumber = (a: number): Maybe<number> => {
  if (isNaN(a)) return Nothing();
  return Just(a);
};

export const fromFinite = (a: number): Maybe<number> => {
  if (isNaN(a)) return Nothing();
  if (!isFinite(a)) return Nothing();
  return Just(a);
};

export const nth = <A>(index: number, arr: Array<A>): Maybe<A> =>
  Constructor<A>(fromOptional(arr[index]));

export const first = <A>(arr: Array<A>): Maybe<A> => Constructor<A>(nth(0, arr));

export const last = <A>(arr: Array<A>): Maybe<A> => Constructor<A>(nth(arr.length - 1, arr));

export const find =
  <A, T extends readonly A[]>(f: (a: A) => boolean, arr: T): Maybe<A> => Constructor<A>(fromOptional(arr.find(f)));

export const record = <R extends Record<string, Maybe<unknown>> | {}>(
  record: R
): Maybe<MaybeConstructType<R>> => {
  return Object.entries(record).reduce(
    (acc, [key, value]): Maybe<MaybeConstructType<R>> => {
      return acc.chain(
        (a): Maybe<MaybeConstructType<R>> => value.map(
          (v): MaybeConstructType<R> => ({ ...a, [key]: v }))
      );
    }, Just({} as MaybeConstructType<R>)
  );
};

export const all = <T extends readonly Maybe<unknown>[] | []>(
  arr: T
): Maybe<MaybeConstructType<T>> => {
  return (arr as readonly Maybe<any>[]).reduce(
    (acc, curr): Maybe<MaybeConstructType<T>> => acc.chain(
      (a): Maybe<MaybeConstructType<T>> => curr.map(
        (v): MaybeConstructType<T> => [...(a as unknown as any[]), v] as unknown as MaybeConstructType<T>)
    ), Just([] as unknown as MaybeConstructType<T>)
  );
};

export const array = all;

export const values = <A extends Array<Maybe<any>>>(
  arr: A
): Array<MaybeType<A[number]>> => {
  return arr.reduce(
    (acc: Array<MaybeType<A[number]>>, curr: A[number]): Array<MaybeType<A[number]>> =>
      fold<MaybeType<A[number]>, Array<MaybeType<A[number]>>>({
        nothing: () => acc,
        just: (v) => [...acc, v],
      }, curr),
    []
  );
};

export const applyAll = <
A extends readonly Maybe<any>[] | [],
P extends any[] & MaybeConstructType<A>,
F extends (...args: P) => any
>(
    f: F,
    args: A
  ): Maybe<ReturnType<F>> => {
  return all(args).map(
    (a): ReturnType<F> => f(...(a as Parameters<F>))
  );
};

export const some = <A extends Array<Maybe<MaybeType<A[number]>>>> (arr: A): Maybe<MaybeType<A[number]>> =>
  arr.reduce(
    (acc, curr): Maybe<MaybeType<A[number]>> => acc.or(curr),
    Nothing<MaybeType<A[number]>>()
  );


export const Maybe = {
  Just,
  Nothing,
  fromOptional,
  fromNullable,
  fromNumber,
  fromFinite,
  parseInt,
  parseFloat,
  nth,
  first,
  last,
  find,
  all,
  some,
  values,
  record,
  array,
  applyAll,
} as const;
