
import Either, { Left, Right } from './either';
import Maybe, { Just, Nothing } from './maybe';
import { curry, FunctionInputType, FunctionOutputType, NonEmptyArray } from './src/utils';

type ResultType<R> = R extends Result<any, infer T>
? T : never;

type ErrorType<R> = R extends Result<infer T, any> ? T : never;

type ResultConstructType<
A extends readonly Result<unknown, unknown>[] | Record<string | symbol | number, Result<unknown, unknown>>
> = { -readonly [P in keyof A]: ResultType<A[P]> };


interface IResult<E, A> {
  base: { tag: 'ok', value: A } | { tag: 'err', error: E }
  map: <B>(fab: (a: A) => B) => Result<E, B>,
  mapError: <F>(fef: (e: E) => F) => Result<F, A>,
  chain: <B>(fab: (a: A) => Result<E, B>) => Result<E, B>,
  apply: (v: Result<E, FunctionInputType<A>>) => Result<E, FunctionOutputType<A>>
  join: () => A extends Result<E, infer T> ? Result<E, T> : never,
  fold: <B>(f: Fold<E, A, B>) => B,
  or: (ra: Result<E, A>) => Result<E, A>,
  orElse: (ra: Result<E, A>) => Result<E, A>,
  default: (a: A) => Result<E, A>,
  toMaybe: () => Maybe<A>,
  toEither: () => Either<E, A>,
  get: () => A | undefined,
  getOrElse: (def: A) => A,
  getValue: () => Maybe<A>,
  getError: () => Maybe<E>,
  toString: () => string,
}

namespace Instance {

abstract class AResult<E, A> implements IResult<E, A> {
protected abstract self: Result<E, A>;

get base(): { tag: 'ok', value: A } | { tag: 'err', error: E }  {
  switch(this.self.tag) {
  case 'ok':
    return { tag: 'ok', value: this.self.value };
  default:
    return { tag: 'err', error: this.self.error };
  }
}


get = () => this.toMaybe().get();
getOrElse = (def: A) => this.toMaybe().getOrElse(def);
default = (def: A) => this.self.tag === 'ok' ? this.self : new Ok<E, A>(def);
or = (other: Result<E, A>) => {
  switch(this.self.tag) {
  case 'ok':
    return this.self;
  default:
    return other.tag === 'ok' ? other : this.self;
  }
};
orElse = (other: Result<E, A>) => other.or(this.self);
map = <B>(fab: (a: A) => B): Result<E, B> => this.self.tag === 'ok'
  ? new Ok<E, B>(fab(this.self.value))
  : new Err<E, B>(this.self.error);
mapError = <F>(fef: (e: E) => F): Result<F, A> => this.self.tag === 'ok'
  ? new Ok<F, A>(this.self.value)
  : new Err<F, A>(fef(this.self.error));

chain = <B>(fab: (a: A) => Result<E, B>): Result<E, B> => this.self.tag === 'ok'
  ? fab(this.self.value) : new Err(this.self.error);
apply = (ra: Result<E, FunctionInputType<A>>): Result<E, FunctionOutputType<A>> =>
this.chain((f) => ra.map((a) => typeof f === 'function'
  ? curry(f as unknown as (...args: any[]) => any)(a)
  : a)) as Result<E, FunctionOutputType<A>>;
join = (): A extends Result<E, infer T> ? Result<E, T> : never =>
this.chain(
  (m) => m instanceof AResult
    ? m as unknown as A extends Result<E, infer T> ? Result<E, T> : never
    : new Ok(m) as unknown as A extends Result<E, infer T> ? Result<E, T> : never
) as A extends Result<E, infer T> ? Result<E, T> : never;
fold = <B>(f: Fold<E, A, B>) => this.self.tag === 'ok' ? f.ok(this.self.value) : f.err(this.self.error);
toMaybe = () => this.getValue();
toEither = () => this.self.tag === 'ok' ? Right<E, A>(this.self.value) : Left<E, A>(this.self.error);
getValue = () => this.self.tag === 'ok' ? Just(this.self.value) : Nothing<A>();
getError = () => this.self.tag === 'ok' ? Nothing<E>() : Just(this.self.error);
toString = () => {
  switch(this.self.tag) {
  case 'ok':
    return `Ok(${this.self.value})`;
  default:
    return `Err(${this.self.error})`;
  }
};
}

export class Ok<E, A> extends AResult<E, A> {
  readonly tag = 'ok';

  constructor(readonly value: A) { super(); }

  protected self = this;
}

export class Err<E, A> extends AResult<E, A> {
  readonly tag = 'err';

  constructor(readonly error: E) { super(); }

  protected self = this;
}

}


type Fold<E, A, B> = {
ok: (a: A) => B,
err: (e: E) => B
}

export type Result<E, A> = Instance.Ok<E, A> | Instance.Err<E, A>;

export const Ok = <E = any, A = unknown>(value: A): Result<E, A> => new Instance.Ok(value);
export const Err = <E = unknown, A = any>(error: E): Result<E, A> => new Instance.Err(error);

export const record = <R extends Record<string | number | symbol, Result<any, any>>>(
  record: R
): Result<ErrorType<R[keyof R]>, ResultConstructType<R>> => {
  return Object.entries(record).reduce(
    (acc, [key, value]): Result<ErrorType<R[keyof R]>, ResultConstructType<R>> => {
      return acc.chain(
        (a): Result<ErrorType<R[keyof R]>, ResultConstructType<R>> => value.map(
          (v): ResultConstructType<R> => ({ ...a, [key]: v }))
      );
    }, Ok({} as ResultConstructType<R>)
  );
};

export const all = <T extends readonly Result<any, any>[] | []>(
  arr: T
): Result<ErrorType<T[number]>, ResultConstructType<T>> => {
  return (arr as readonly Result<any, any>[]).reduce(
    (acc, curr): Result<ErrorType<T[number]>, ResultConstructType<T>> => acc.chain(
      (a): Result<ErrorType<T[number]>, ResultConstructType<T>> => curr.map(
        (v): ResultConstructType<T> => [...(a as unknown as any[]), v] as unknown as ResultConstructType<T>)
    ), Ok([] as unknown as ResultConstructType<T>)
  );
};

export const array = all;

export const applyAll = <
A extends readonly Result<any, any>[] | [],
P extends any[] & ResultConstructType<A>,
F extends (...args: P) => any
>(
    f: F,
    args: A
  ): Result<ErrorType<A[number]>, ReturnType<F>> => {
  return all(args).map(
    (a): ReturnType<F> => f(...(a as Parameters<F>))
  );
};

export const some = <A extends NonEmptyArray<Result<ErrorType<A[number]>, ResultType<A[number]>>>> (arr: A): A[number] =>
  arr.reduce((acc, curr) => acc.or(curr));

export const values = <A extends Array<Result<any, any>>>(arr: A): Array<ResultType<A[number]>> => {
  return arr.reduce(
    (acc: Array<ResultType<A[number]>>, curr: A[number]): Array<ResultType<A[number]>> =>
      curr.fold<Array<ResultType<A[number]>>>({
        err: () => acc,
        ok: (v) => [...acc, v],
      }),
    []
  );
};

export const Result = {
  Ok,
  Err,
  applyAll,
  all,
  some,
  array,
  record,
  values
} as const;

export default Result;
