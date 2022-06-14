import Maybe, { Just, Nothing } from './maybe';
import Result from './result';
import { curry, FunctionInputType, FunctionOutputType, NonEmptyArray } from './src/utils';


type RemoteDataType<R> = R extends RemoteData<any, infer T>
? T : never;

type ErrorType<R> = R extends RemoteData<infer T, any> ? T : never;

type RemoteDataConstructType<
A extends readonly RemoteData<unknown, unknown>[] | Record<string | symbol | number, RemoteData<unknown, unknown>>
> = { -readonly [P in keyof A]: RemoteDataType<A[P]> };


interface IRemoteData<E, A> {
  base: { tag: 'success', value: A } | { tag: 'failure', error: E } | { tag: 'loading' | 'not asked' }
  map: <B>(fab: (a: A) => B) => RemoteData<E, B>,
  mapError: <F>(fef: (e: E) => F) => RemoteData<F, A>,
  chain: <B>(fab: (a: A) => RemoteData<E, B>) => RemoteData<E, B>,
  apply: (v: RemoteData<E, FunctionInputType<A>>) => RemoteData<E, FunctionOutputType<A>>
  join: () => A extends RemoteData<E, infer T> ? RemoteData<E, T> : never,
  fold: <B>(f: Fold<E, A, B>) => B,
  or: (ra: RemoteData<E, A>) => RemoteData<E, A>,
  orElse: (ra: RemoteData<E, A>) => RemoteData<E, A>,
  default: (a: A) => RemoteData<E, A>,
  toMaybe: () => Maybe<A>,
  get: () => A | undefined,
  getOrElse: (def: A) => A,
  getValue: () => Maybe<A>,
  getError: () => Maybe<E>,
  toString: () => string,
}

namespace Instance {
  abstract class ARemoteData<E, A> implements IRemoteData<E, A> {
  protected abstract self: RemoteData<E, A>;

  get base(): { tag: 'success', value: A } | { tag: 'failure', error: E } | { tag: 'loading' | 'not asked' }  {
    switch(this.self.tag) {
    case 'success':
      return { tag: 'success', value: this.self.value };
    case 'failure':
      return { tag: 'failure', error: this.self.error };
    default:
      return { tag: this.self.tag };
    }
  }


  get = () => this.toMaybe().get();
  getOrElse = (def: A) => this.toMaybe().getOrElse(def);
  default = (def: A) => this.self.tag === 'success' ? this.self : new Success<E, A>(def);
  or = (other: RemoteData<E, A>) => {
    switch(this.self.tag) {
    case 'success':
      return this.self;
    default:
      return other.tag === 'success' ? other : this.self;
    }
  };
  orElse = (other: RemoteData<E, A>) => other.or(this.self);
  map = <B>(fab: (a: A) => B): RemoteData<E, B> => {
    switch(this.self.tag) {
    case 'success':
      return new Success<E, B>(fab(this.self.value));
    case 'failure':
      return new Failure<E, B>(this.self.error);
    case 'loading':
      return new Loading<E, B>();
    case 'not asked':
      return new NotAsked<E, B>();
    }
  };

  mapError = <F>(fef: (e: E) => F):  RemoteData<F, A> => {
    switch(this.self.tag) {
    case 'success':
      return new Success<F, A>(this.self.value);
    case 'failure':
      return new Failure<F, A>(fef(this.self.error));
    case 'loading':
      return new Loading<F, A>();
    case 'not asked':
      return new NotAsked<F, A>();
    }
  };

  chain = <B>(fab: (a: A) => RemoteData<E, B>): RemoteData<E, B> => {
    switch(this.self.tag) {
    case 'success':
      return fab(this.self.value);
    case 'failure':
      return new Failure<E, B>(this.self.error);
    case 'loading':
      return new Loading<E, B>();
    case 'not asked':
      return new NotAsked<E, B>();
    }
  };
  apply = (ra: RemoteData<E, FunctionInputType<A>>): RemoteData<E, FunctionOutputType<A>> =>
  this.chain((f) => ra.map((a) => typeof f === 'function'
    ? curry(f as unknown as (...args: any[]) => any)(a)
    : a)) as RemoteData<E, FunctionOutputType<A>>;
  join = (): A extends RemoteData<E, infer T> ? RemoteData<E, T> : never =>
  this.chain(
    (m) => m instanceof ARemoteData
      ? m as unknown as A extends RemoteData<E, infer T> ? RemoteData<E, T> : never
      : new Success(m) as unknown as A extends RemoteData<E, infer T> ? RemoteData<E, T> : never
  ) as A extends RemoteData<E, infer T> ? RemoteData<E, T> : never;
  fold = <B>(f: Fold<E, A, B>) => {
    switch(this.self.tag) {
    case 'success':
      return f.success(this.self.value);
    case 'failure':
      return f.failure(this.self.error);
    case 'loading':
      return f.loading();
    case 'not asked':
      if ('not asked' in f) return  f['not asked']();
      return f.notAsked();
    }
  };
  toMaybe = () => this.getValue();
  getValue = () => this.self.tag === 'success' ? Just(this.self.value) : Nothing<A>();
  getError = () => this.self.tag === 'failure' ? Just(this.self.error) : Nothing<E>();
  toString = () => {
    switch(this.self.tag) {
    case 'success':
      return `Success(${this.self.value})`;
    case 'failure':
      return `Failure(${this.self.error})`;
    case 'loading':
      return 'Loading';
    case 'not asked':
      return 'NotAsked';
    }
  };
  }

  export class Success<E, A> extends ARemoteData<E, A> {
    readonly tag = 'success';

    constructor(readonly value: A) { super(); }

    protected self = this;
  }

  export class Failure<E, A> extends ARemoteData<E, A> {
    readonly tag = 'failure';

    constructor(readonly error: E) { super(); }

    protected self = this;
  }

  export class Loading<E, A> extends ARemoteData<E, A> {
    readonly tag = 'loading';

    protected self = this;
  }

  export class NotAsked<E, A> extends ARemoteData<E, A> {
    readonly tag = 'not asked';

    protected self = this;
  }
}

type Fold<E, A, B> = {
  success: (a: A) => B,
  failure: (e: E) => B,
  loading: () => B
} &
  ({ 'not asked': () => B }
  | { notAsked: () => B })

export type RemoteData<E, A> = Instance.NotAsked<E, A> | Instance.Loading<E, A> | Instance.Success<E, A> | Instance.Failure<E, A>;

export const Success = <A, E = any>(value: A): RemoteData<E, A> => new Instance.Success(value);
export const Failure = <E, A = any>(error: E): RemoteData<E, A> => new Instance.Failure(error);
export const Loading = <E = any, A = any>(): RemoteData<E, A> => new Instance.Loading();
export const NotAsked = <E = any, A = any>(): RemoteData<E, A> => new Instance.NotAsked();

export const record = <R extends Record<string | number | symbol, RemoteData<any, any>>>(
  record: R
): RemoteData<ErrorType<R[keyof R]>, RemoteDataConstructType<R>> => {
  return Object.entries(record).reduce(
    (acc, [key, value]): RemoteData<ErrorType<R[keyof R]>, RemoteDataConstructType<R>> => {
      return acc.chain(
        (a): RemoteData<ErrorType<R[keyof R]>, RemoteDataConstructType<R>> => value.map(
          (v): RemoteDataConstructType<R> => ({ ...a, [key]: v }))
      );
    }, Success({} as RemoteDataConstructType<R>)
  );
};

export const all = <T extends readonly RemoteData<any, any>[] | []>(
  arr: T
): RemoteData<ErrorType<T[number]>, RemoteDataConstructType<T>> => {
  return (arr as readonly RemoteData<any, any>[]).reduce(
    (acc, curr): RemoteData<ErrorType<T[number]>, RemoteDataConstructType<T>> => acc.chain(
      (a): RemoteData<ErrorType<T[number]>, RemoteDataConstructType<T>> => curr.map(
        (v): RemoteDataConstructType<T> => [...(a as unknown as any[]), v] as unknown as RemoteDataConstructType<T>)
    ), Success([] as unknown as RemoteDataConstructType<T>)
  );
};

export const array = all;

export const applyAll = <
A extends readonly RemoteData<any, any>[] | [],
P extends any[] & RemoteDataConstructType<A>,
F extends (...args: P) => any
>(
    f: F,
    args: A
  ): RemoteData<ErrorType<A[number]>, ReturnType<F>> => {
  return all(args).map(
    (a): ReturnType<F> => f(...(a as Parameters<F>))
  );
};

export const some = <A extends NonEmptyArray<RemoteData<ErrorType<A[number]>, RemoteDataType<A[number]>>>> (arr: A): A[number] =>
  arr.reduce((acc, curr) => acc.or(curr));

export const values = <A extends Array<RemoteData<any, any>>>(arr: A): Array<RemoteDataType<A[number]>> => {
  return arr.reduce(
    (acc: Array<RemoteDataType<A[number]>>, curr: A[number]): Array<RemoteDataType<A[number]>> =>
      curr.fold<Array<RemoteDataType<A[number]>>>(      {
        notAsked: () => acc,
        loading: () => acc,
        failure: () => acc,
        success: (v) => [...acc, v]
      }),
    []
  );
};

export const fromResult = <E, A>(r: Result<E, A>): RemoteData<E, A> => r.fold({
  err: Failure,
  ok: Success
});

export const RemoteData = {
  Success,
  Failure,
  Loading,
  NotAsked,
  applyAll,
  all,
  some,
  array,
  record,
  values,
  fromResult
} as const;

export default RemoteData;
