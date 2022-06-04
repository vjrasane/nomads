import { curry, FunctionInputType, FunctionOutputType } from './function';
import { isNonNullable, isNonOptional, NonOptional, Optional } from './optional';
import { isType } from './type';

const Brand: unique symbol = Symbol('Maybe');

type MaybeType<M> = M extends Maybe<infer T>
  ? T : never;

type MaybeConstructType<
  A extends readonly Maybe<unknown>[] | Record<string | symbol | number, Maybe<unknown>>
> = { -readonly [P in keyof A]: MaybeType<A[P]> };

interface IMaybe<A> {
  base: { tag: 'just', value: A } | { tag: 'nothing'}
  get: () => Optional<A>;
  map: <B>(fab: (a: A) => B) => Maybe<B>;
  chain: <B>(fab: (a: A) => Maybe<B>) => Maybe<B>;
  apply: (v: Maybe<FunctionInputType<A>>) => Maybe<FunctionOutputType<A>>;
  join: () => A extends Maybe<infer T> ? Maybe<T> : never,
}

class JustClass<A> implements IMaybe<A>{
  readonly [Brand] = Brand;
  readonly tag: 'just';
  constructor(readonly value: A) {}

  get base():  { tag: 'just', value: A }  {
    return { tag: 'just', value: this.value };
  }

  get = () => this.value;
  map = <B>(fab: (a: A) => B): Maybe<B> => new JustClass(fab(this.value));
  chain = <B>(fab: (a: A) => Maybe<B>): Maybe<B> => fab(this.value);
  apply = (ma: Maybe<FunctionInputType<A>>): Maybe<FunctionOutputType<A>> =>
    this.chain((f) => ma.map((a) => typeof f === 'function'
      ? curry(f as unknown as (...args: any[]) => any)(a)
      : a)) as Maybe<FunctionOutputType<A>>;
  join = (): A extends Maybe<infer T> ? Maybe<T> : never =>
      this.chain(
        (m) => isType<Maybe<any>>(Brand, m)
          ? m as unknown as A extends Maybe<infer T> ? Maybe<T> : never
          : new JustClass(m) as unknown as A extends Maybe<infer T> ? Maybe<T> : never
      ) as A extends Maybe<infer T> ? Maybe<T> : never;
}

class NothingClass<A> implements IMaybe<A> {
  readonly [Brand] = Brand;
  readonly tag: 'nothing';
  get base():  { tag: 'nothing'}  {
    return { tag: 'nothing' };
  }

  get = () => undefined;
  map = () => new NothingClass();
  chain = () => new NothingClass();
  apply = () => new NothingClass();
  join = () => this as unknown as A extends Maybe<infer T> ? Maybe<T> : never;
}

type Just<A> = {
  readonly tag: 'just',
  readonly value: A,
} & IMaybe<A>;
type Nothing<A> = {
  readonly tag: 'nothing',
} & IMaybe<A>;

export type Maybe<A> = Just<A> | Nothing<A>;

export const Just = <A>(value: A): Maybe<A> => new JustClass(value);
export const Nothing = <A>(): Maybe<A> => new NothingClass<A>();

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

export const applyAll = <
A extends readonly Maybe<unknown>[] | [],
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
  fromOptional(arr[index]);

export const first = <A>(arr: Array<A>): Maybe<A> => nth(0, arr);

export const last = <A>(arr: Array<A>): Maybe<A> => nth(arr.length - 1, arr);

export const find =
  <A, T extends readonly A[]>(f: (a: A) => boolean, arr: T): Maybe<A> => fromOptional(arr.find(f));

// export const some = <A extends Array<Maybe<MaybeType<A[number]>>>> (arr: A): Maybe<MaybeType<A[number]>> =>
// arr.reduce(
//   (acc, curr): Maybe<MaybeType<A[number]>> => acc.or(curr),
//   Nothing<MaybeType<A[number]>>()
// );

// export const values = <A extends Array<Maybe<any>>>(
//   arr: A
// ): Array<MaybeType<A[number]>> => {
//   return arr.reduce(
//     (acc: Array<MaybeType<A[number]>>, curr: A[number]): Array<MaybeType<A[number]>> =>
//       fold<MaybeType<A[number]>, Array<MaybeType<A[number]>>>({
//         nothing: () => acc,
//         just: (v) => [...acc, v],
//       }, curr),
//     []
//   );
// };

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
  // some,
  // values,
  record,
  array,
  applyAll,
} as const;



// m.map((n) => n * 2).map(())

// constm.apply(Just.of(42));



// type TT = MaybeType<typeof v>

