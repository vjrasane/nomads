import { Err, Ok, Result } from '../result';
import { curry, FunctionInputType, FunctionOutputType } from './function';
import { Optional } from './optional';
import { isType } from './type';
import * as Classes from "./maybe.classes";


type MaybeType<M> = M extends Maybe<infer T>
  ? T : never;

type MaybeConstructType<
  A extends readonly Maybe<unknown>[] | Record<string | symbol | number, Maybe<unknown>>
> = { -readonly [P in keyof A]: MaybeType<A[P]> };

export type Maybe<A> = Classes.Just<A> | Classes.Nothing<A>;

export const Just = <A>(value: A): Maybe<A> => new Classes.Just(value);
export const Nothing = <A>(): Maybe<A> => new Classes.Nothing<A>();

export const record = <R extends Record<string, Maybe<any>> | {}>(
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

export const all = <T extends readonly Maybe<any>[] | []>(
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


export const fromOptional = <A>(a: A | undefined): Maybe<A> => {
  if (a !== undefined) return Just(a);
  return Nothing();
};

export const fromNullable = <A>(
  a: A | null | undefined
): Maybe<A> => {
  if (a != null) return Just(a);
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

