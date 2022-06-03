import { Err, Ok, Result } from './result';
import { isType } from './src/type';
import { isNonNullable, isNonOptional, NonOptional, Nullable, Optional } from './src/optional';
import { curry, FunctionInputType, FunctionOutputType } from './src/function';

const Brand: unique symbol = Symbol("Maybe");
namespace I {
  export type Just<A> = {
    readonly tag: 'just';
    readonly value: A;
  };

  export type Nothing = {
    readonly tag: 'nothing';
  };

  export type Maybe<A> = Just<A> | Nothing;
  
  const just = "just";
  const nothing = "nothing";


  export const Just = <A>(value: A): Maybe<A> => ({ tag: just, value });
  export const Nothing: Maybe<any> = { tag: nothing };
  export interface Tagged<A> {
    [just]: Just<A>,
    [nothing]: Nothing
  }
 

  export const toOptional = <A>(m: Maybe<A>): Optional<A> => {
    switch (m.tag) {
    case 'just':
      return m.value;
    default:
      return undefined;
    }
  };

  export const map =
    <A, B>(fab: (a: A) => B, m: Maybe<A>): Maybe<B> => {
        switch (m.tag) {
        case 'just':
          return Just(fab(m.value));
        default:
          return m;
        }
      };

  export const chain = <A, B>(fab: (a: A) => I.Maybe<B>, m: I.Maybe<A>): I.Maybe<B> => {
    switch (m.tag) {
    case 'just':
      return fab(m.value);
    default:
      return m;
    }
  };  

  export const filter =
    <A>(f: (a: A) => boolean, m: Maybe<A>): Maybe<A> => {
        switch (m.tag) {
        case 'just':
          return f(m.value) ? m : Nothing;
        default:
          return m;
        }
      };

  export type Fold<A, B> = {
    just: (a: A) => B;
    nothing: () => B;
  };

  export const fold =
    <A, B>(f: Fold<A, B>, m: Maybe<A>): B => {
        switch (m.tag) {
        case 'just':
          return f.just(m.value);
        default:
          return f.nothing();
        }
      };

  export const or =
    <A>(first: Maybe<A>, second: Maybe<A>): Maybe<A> => {
        switch (first.tag) {
        case 'just':
          return first;
        default:
          return second;
        }
      };

  export const orElse =
    <A>(first: Maybe<A>, second: Maybe<A>): Maybe<A> => {
        switch (second.tag) {
        case 'just':
          return second;
        default:
          return first;
        }
      };

  export const defaultTo =
    <A>(def: A, m: Maybe<A>): Maybe<A> => {
        switch (m.tag) {
        case 'just':
          return m;
        default:
          return Just(def);
        }
      };

  export const getOrElse =
    <A>(def: A, m: Maybe<A>): A => {
        switch (m.tag) {
        case 'just':
          return m.value;
        default:
          return def;
        }
      };

  export const toResult =
    <E, A>(err: E, m: Maybe<A>): Result<E, A> => {
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

  export const fromOptional = <A>(a: A | undefined): Maybe<NonOptional<A>> => {
    if (isNonOptional(a)) return Just(a);
    return Nothing;
  };

  export const fromNullable = <A>(
    a: A | null | undefined
  ): Maybe<NonNullable<A>> => {
    if (isNonNullable(a)) return Just(a);
    return Nothing;
  };

  export const fromNumber = (a: number): Maybe<number> => {
    if (isNaN(a)) return Nothing;
    return Just(a);
  };

  export const fromFinite = (a: number): Maybe<number> => {
    if (isNaN(a)) return Nothing;
    if (!isFinite(a)) return Nothing;
    return Just(a);
  };

  export const nth = <A>(index: number, arr: Array<A>): Maybe<A> =>
    fromOptional(arr[index]);

  export const first = <A>(arr: Array<A>): Maybe<A> => nth(0, arr);

  export const last = <A>(arr: Array<A>): Maybe<A> => nth(arr.length - 1, arr);

  export const find =
    <A, T extends readonly A[]>(f: (a: A) => boolean, arr: T): Maybe<A> =>
        fromOptional(arr.find(f));

  export const record = <R extends Record<string, Maybe<any>>>(
    record: R
  ): Maybe<MaybeTypeConstruct<R>> => {
    return Object.entries(record).reduce(
      (acc, [key, value]) => chain((a) => map((v) => ({ ...a, [key]: v }), value), acc), Just({})
    ) as unknown as Maybe<MaybeTypeConstruct<R>>;
  };
        
  export const all = <T extends readonly Maybe<any>[] | []>(
    arr: T
  ): Maybe<MaybeTypeConstruct<T>> => {
    return (arr as readonly Maybe<any>[]).reduce(
      (acc, curr): Maybe<MaybeTypeConstruct<T>> => {
        return chain(
          (a) => map(
            (v) => [...a, v] as unknown as MaybeTypeConstruct<T>, 
            curr),
          acc)
      },
      Just([])
    );
  };

  export const some = <A extends Array<Maybe<any>>>(
    arr: A
  ): Maybe<MaybeType<A[number]>> => {
    return arr.reduce(
      (acc, curr): Maybe<MaybeType<A[number]>> => or(acc, curr),
      Nothing
    );
  };


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
  P extends any[] & MaybeTypeConstruct<A>,
  F extends (...args: P) => any
>(
      f: F,
      args: A
    ): Maybe<ReturnType<F>> => {
    return map((args) => f(...(args as Parameters<F>)), all(args)) 
  };

  const aaa = applyAll(
    (a: string, b: number) => "lol",
    [Just("str"), Just(42)]
  )

  const ddd =   [Just("str"), Just(42)] as const;

  type D = MaybeTypeConstruct<typeof ddd>;

  const dddd = Just(42);

  type B = MaybeType<Maybe<number>>

  export const concatTo = <A, T>(arr: Array<A | T>, m: Maybe<A>): Array<A | T> => I.getOrElse(arr, I.map((v) => [v, ...arr], m))
  export const appendTo = <A, T>(arr: Array<A | T>, m: Maybe<A>): Array<A | T> => I.getOrElse(arr, I.map((v) => [...arr, v], m))

  export const join = 
  <A>(m: Maybe<A>): A extends Maybe<infer T> ? Maybe<T> : never => {
    return chain(
      mm => isType<Maybe<any>>(Brand, mm) ? mm : Just(mm),
      m) as A extends Maybe<infer T> ? Maybe<T> : never;
  }

  export const apply =
  <A>(ma: I.Maybe<FunctionInputType<A>>, mf: I.Maybe<A>): I.Maybe<FunctionOutputType<A>> =>
    I.chain(
      (f) => I.map(
        (a) => typeof f === 'function'
          ? curry(f as unknown as (...args: any[]) => any)(a)
          : a, 
        ma),
      mf)
}

export type IMaybe<T extends keyof I.Tagged<A>, A> = {
  readonly maybe: I.Maybe<A>;
  get: () => Optional<A>;
  map: <B>(fab: (a: A) => B) => Maybe<B>;
  chain: <B>(fab: (a: A) => Maybe<B>) => Maybe<B>;
  apply: (v: Maybe<FunctionInputType<A>>) => Maybe<FunctionOutputType<A>>;
  join: () => A extends Maybe<infer T> ? Maybe<T> : never, 
  or: (m: Maybe<A>) => Maybe<A>;
  orElse: (m: Maybe<A>) => Maybe<A>;
  default: (a: A) => Maybe<A>;
  filter: (f: (a: A) => boolean) => Maybe<A>;
  fold: <B>(f: I.Fold<A, B>) => B;
  getOrElse: (def: A) => A;
  toResult: <E>(err: E) => Result<E, A>;
  toString: () => string;
  concatTo: <T>(arr: Array<T | A>) => Array<T | A>;
  appendTo: <T>(arr: Array<T | A>) => Array<T | A>;
} & I.Tagged<A>[T]

type MaybeType<M> = M extends I.Maybe<infer T> ? T : never;

type MaybeTypeConstruct<
  A extends readonly I.Maybe<any>[] | Record<string | symbol | number, Maybe<any>>
> = { -readonly [P in keyof A]: MaybeType<A[P]> };

export type Maybe<A> = IMaybe<"just", A> | IMaybe<"nothing" ,A>; 

const Constructor = <A>(data: I.Maybe<A>): Maybe<A> => ({
  maybe: data,
  ...data,
  map: (fab) => Constructor(I.map(fab, data)),
  chain: (fab) => Constructor(I.chain(fab, data)),
  apply: (v) => Constructor(I.apply(v, data)),
  join: () => join(data),
  filter: (f) => Constructor(I.filter(f, data)),
  fold: (f) => I.fold(f, data),
  or: (other) => Constructor(I.or(data, other)),
  orElse: (other) => Constructor(I.orElse(data, other)),
  default: (def) => Constructor(I.defaultTo(def, data)),
  toResult: <E>(err: E) => I.toResult<E, A>(err, data),
  toString: () => I.toString(data),
  get: () => I.toOptional(data),
  getOrElse: (def) => I.getOrElse(def, data),
  concatTo: <T>(arr: Array<A | T>) => I.concatTo<A, T>(arr, Constructor(data)),
  appendTo: <T>(arr: Array<A | T>) => I.appendTo<A, T>(arr, Constructor(data))
});

export const Just = <A>(v: A): Maybe<A> => Constructor(I.Just(v));

export const Nothing = <A = any>(): Maybe<A> => Constructor<A>(I.Nothing);

export const join = 
<A>(m: I.Maybe<A>): A extends Maybe<infer T> ? Maybe<T> : never => {
  return Constructor(I.join(m)) as  A extends Maybe<infer T> ? Maybe<T> : never;
}

export const all = <T extends readonly I.Maybe<any>[] | []>(
  arr: T
): Maybe<MaybeTypeConstruct<T>> => Constructor(I.all(arr));

export const some = <A extends Array<I.Maybe<any>>>(
  arr: A
): Maybe<MaybeType<A[number]>> => Constructor(I.some(arr))

export const values = <A extends Array<I.Maybe<any>>>(
  arr: A
): Array<MaybeType<A[number]>> => I.values(arr)

export const record = <R extends Record<string, I.Maybe<any>>>(
  record: R
): Maybe<MaybeTypeConstruct<R>> => Constructor(I.record(record))

export const applyAll = <
  A extends readonly I.Maybe<any>[] | [],
  P extends any[] & MaybeTypeConstruct<A>,
  F extends (...args: P) => any
>(f: F,  args: A): Maybe<ReturnType<F>> => Constructor(I.applyAll<A, P, F>(f, args));

export const fromOptional = <A>(a: Optional<A>): Maybe<NonOptional<A>> =>
  Constructor(I.fromOptional(a));
export const fromNullable = <A>(a: Nullable<A>): Maybe<NonNullable<A>> =>
  Constructor(I.fromNullable(a));
export const fromNumber = (a: number): Maybe<number> =>
  Constructor(I.fromNumber(a));
export const fromFinite = (a: number): Maybe<number> => 
  Constructor(I.fromFinite(a))
export const nth = <A>(index: number, arr: Array<A>): Maybe<A> =>
  Constructor(I.nth(index, arr));
export const first = <A>(arr: Array<A>): Maybe<A> =>
  Constructor(I.first(arr));
export const last = <A>(arr: Array<A>): Maybe<A> =>
  Constructor(I.last(arr));
export const find = <A, T extends readonly A[]>(
  f: (a: A) => boolean,
  arr: T
): Maybe<A> => Constructor(I.find(f, arr));
export const parseInt = (str: string): Maybe<number> =>
  fromNumber(Number.parseInt(`${Number(str || 'NaN')}`));
export const parseFloat = (str: string): Maybe<number> =>
  fromNumber(Number.parseFloat(`${Number(str || 'NaN')}`));
export const array = all;

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
