import { Err, Ok, Result } from './result';
import { curry, FunctionInputType, FunctionOutputType } from './src/utils';

type MaybeType<M> = M extends Maybe<infer T>
? T : never;

type MaybeConstructType<
A extends readonly Maybe<any>[] | Record<string | symbol | number, Maybe<any>>
> = { -readonly [P in keyof A]: MaybeType<A[P]> };

interface IMaybe<A> {
  base: { tag: 'just', value: A } | { tag: 'nothing'}
  get: () => A | undefined;
  getOrElse: (def: A) => A;
  default: (a: A) => Maybe<A>;
  map: <B>(fab: (a: A) => B) => Maybe<B>;
  chain: <B>(fab: (a: A) => Maybe<B>) => Maybe<B>;
  apply: (v: Maybe<FunctionInputType<A>>) => Maybe<FunctionOutputType<A>>;
  join: () => A extends Maybe<infer T> ? Maybe<T> : never,
  or: (m: Maybe<A>) => Maybe<A>;
  orElse: (m: Maybe<A>) => Maybe<A>;
  filter: (f: (a: A) => boolean) => Maybe<A>;
  fold: <B>(f: Fold<A, B>) => B;
  toResult: <E>(err: E) => Result<E, A>;
  toString: () => string;
  concatTo: <T>(arr: Array<T | A>) => Array<T | A>;
  appendTo: <T>(arr: Array<T | A>) => Array<T | A>;
}

namespace Instance {
  abstract class AMaybe<A> implements IMaybe<A> {
    protected abstract self: Maybe<A>;

    get base(): { tag: 'just', value: A } | { tag: 'nothing'}  {
      switch(this.self.tag) {
      case 'just':
        return { tag: 'just', value: this.self.value };
      default:
        return { tag: 'nothing' };
      }
    }

    get = () => this.self.tag === 'just' ? this.self.value : undefined;
    getOrElse = (def: A) => this.self.tag === 'just' ? this.self.value : def;
    default = (a: A) => this.self.tag === 'just' ? this.self : new Just(a);
    or = (other: Maybe<A>) => this.self.tag === 'just' ? this.self : other;
    orElse = (other: Maybe<A>) => other.or(this.self);
    filter = (f: (a: A) => boolean): Maybe<A> => this.chain(
      (a: A) => f(a) ? this.self : new Nothing()
    );
    fold = <B>(f: Fold<A, B>) => this.self.tag === 'just' ? f.just(this.self.value) : f.nothing();
    map = <B>(fab: (a: A) => B): Maybe<B> => this.self.tag === 'just'
      ? new Just(fab(this.self.value))
      : new Nothing();
    chain = <B>(fab: (a: A) => Maybe<B>): Maybe<B> => this.self.tag === 'just'
      ? fab(this.self.value) : new Nothing();
    apply = (ma: Maybe<FunctionInputType<A>>): Maybe<FunctionOutputType<A>> =>
    this.chain((f) => ma.map((a) => typeof f === 'function'
      ? curry(f as unknown as (...args: any[]) => any)(a)
      : a)) as Maybe<FunctionOutputType<A>>;
    join = (): A extends Maybe<infer T> ? Maybe<T> : never =>
    this.chain(
      (m) => m instanceof AMaybe
        ? m as unknown as A extends Maybe<infer T> ? Maybe<T> : never
        : new Just(m) as unknown as A extends Maybe<infer T> ? Maybe<T> : never
    ) as A extends Maybe<infer T> ? Maybe<T> : never;
    toResult = <E>(err: E): Result<E, A> => this.self.tag === 'just' ? Ok(this.self.value) : Err(err);
    concatTo = <T>(arr: Array<A | T>): Array<A | T> => this.map((v) => [v, ...arr]).getOrElse(arr);
    appendTo = <T>(arr: Array<A | T>): Array<A | T> => this.map((v) => [...arr, v]).getOrElse(arr);
    toString = () => {
      switch(this.self.tag) {
      case 'just':
        return `Just(${this.self.value})`;
      default:
        return 'Nothing';
      }
    };
  }

    export class Just<A> extends AMaybe<A> {
      readonly tag = 'just';
      constructor(readonly value: A) { super(); }

      protected self = this;
    }

    export class Nothing<A> extends AMaybe<A> {
      readonly tag = 'nothing';

      protected self = this;
    }
}

type Fold<A, B> = {
  just: (a: A) => B;
  nothing: () => B;
};

export type Maybe<A> = Instance.Just<A> | Instance.Nothing<A>;

export const Just = <A = unknown>(value: A): Maybe<A> => new Instance.Just(value);
export const Nothing = <A = any>(): Maybe<A> => new Instance.Nothing<A>();

export const record = <R extends Record<string | number | symbol, Maybe<any>>>(
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

export const fromNonEmptyString = (
  a: string
): Maybe<string> => a.length ? Just(a) : Nothing();

export const fromNumber = (a: number): Maybe<number> => {
  if (isNaN(a)) return Nothing();
  return Just(a);
};

export const fromFinite = (a: number): Maybe<number> => {
  if (isNaN(a)) return Nothing();
  if (!isFinite(a)) return Nothing();
  return Just(a);
};

export const parseInt = (str: string): Maybe<number> =>
  fromNumber(Number.parseInt(`${Number(str || 'NaN')}`));
export const parseFloat = (str: string): Maybe<number> =>
  fromNumber(Number.parseFloat(`${Number(str || 'NaN')}`));

export const nth = <A>(index: number, arr: Array<A>): Maybe<A> =>
  fromOptional(arr[index]);

export const first = <A>(arr: Array<A>): Maybe<A> => nth(0, arr);

export const last = <A>(arr: Array<A>): Maybe<A> => nth(arr.length - 1, arr);

export const find =
<A, T extends readonly A[]>(f: (a: A) => boolean, arr: T): Maybe<A> => fromOptional(arr.find(f));

export const some = <A extends Array<Maybe<MaybeType<A[number]>>>> (arr: A): Maybe<MaybeType<A[number]>> =>
  arr.reduce(
    (acc, curr): Maybe<MaybeType<A[number]>> => acc.or(curr),
    Nothing<MaybeType<A[number]>>()
  );

export const values = <A extends Array<Maybe<any>>>(arr: A): Array<MaybeType<A[number]>> => {
  return arr.reduce(
    (acc: Array<MaybeType<A[number]>>, curr: A[number]): Array<MaybeType<A[number]>> =>
      curr.fold<Array<MaybeType<A[number]>>>({
        nothing: () => acc,
        just: (v) => [...acc, v],
      }),
    []
  );
};

export const Maybe = {
  Just,
  Nothing,
  fromOptional,
  fromNullable,
  fromNonEmptyString,
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

export default Maybe;