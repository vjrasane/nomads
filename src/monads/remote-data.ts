import { Just, Maybe, Nothing } from './maybe';
import { NonEmptyArray } from './non-empty-array';

namespace I {

type StandBy = { readonly tag: 'stand by' };

type Loading = { readonly tag: 'loading' };

type Success<T> = {
  readonly tag: 'success';
  readonly data: T;
};

type Failure<E> = {
  readonly tag: 'failure';
  readonly error: E;
};

export type RemoteData<E, A> = StandBy | Loading | Success<A> | Failure<E>;

export const StandBy: RemoteData<any, any> = { tag: 'stand by' };

export const Loading: RemoteData<any, any> = { tag: 'loading' };

export const Success = <A>(data: A): RemoteData<any, A> => ({ tag: 'success', data });

export const Failure = <E>(error: E): RemoteData<E, any> => ({ tag: 'failure', error });

export const map =
  <E, A, B>(fab: (a: A) => B) =>
    (r: RemoteData<E, A>): RemoteData<E, B> => {
      switch (r.tag) {
      case 'success':
        return Success(fab(r.data));
      default:
        return r;
      }
    };

export const mapError =
  <E, A, B>(feb: (e: E) => B) =>
    (r: RemoteData<E, A>): RemoteData<B, A> => {
      switch (r.tag) {
      case 'failure':
        return Failure(feb(r.error));
      default:
        return r;
      }
    };

export const getData = <E, A>(r: RemoteData<E, A>): Maybe<A> => {
  switch (r.tag) {
  case 'success':
    return Just(r.data);
  default:
    return Nothing;
  }
};

export const getError = <E, A>(r: RemoteData<E, A>): Maybe<E> => {
  switch (r.tag) {
  case 'failure':
    return Just(r.error);
  default:
    return Nothing;
  }
};

export const getOrElse =
  <E, A>(def: A) =>
    (r: RemoteData<E, A>): A => {
      switch (r.tag) {
      case 'success':
        return r.data;
      default:
        return def;
      }
    };

export const defaultTo =
  <E, A>(def: A) =>
    (r: RemoteData<E, A>): RemoteData<E, A> => {
      switch (r.tag) {
      case 'success':
        return r;
      default:
        return Success(def);
      }
    };

export type Fold<E, A, B> = {
  success: (a: A) => B,
  loading: () => B,
  'stand by': () => B,
  failure: (e: E) => B
}

export const fold = <E, A, B>(f: Fold<E, A, B>) => (r: RemoteData<E, A>): B => {
  switch(r.tag) {
  case 'success':
    return f.success(r.data);
  case 'failure':
    return f.failure(r.error);
  case 'stand by':
    return f['stand by']();
  default:
    return f.loading();
  }
};

export const or =
    <E, A>(first: RemoteData<E, A>) =>
    (second: RemoteData<E, A>): RemoteData<E, A> => {
      switch (second.tag) {
      case 'success':
        return first.tag === 'success' ? first : second;
      default:
        return first;
      }
    };
  
export const orElse =
    <E, A>(first: RemoteData<E, A>) =>
    (second: RemoteData<E, A>): RemoteData<E, A> =>
      or(second)(first);

export const toString = <E, A>(r: RemoteData<E, A>): string => {
  switch (r.tag) {
  case 'stand by':
    return 'StandBy';
  case 'loading':
    return 'Loading';
  case 'success':
    return `Success(${r.data})`;
  default:
    return `Failure(${r.error})`;
  }
};

}

type RemoteDataType<R> = R extends RemoteData<any, infer T> ? T : never;

export class RemoteData<E, A> {
  constructor(private readonly internal: I.RemoteData<E, A>) {}

  static from = <E, A>(r: I.RemoteData<E, A>) => new RemoteData<E, A>(r);
  static Success = <A>(value: A) => RemoteData.from(I.Success(value));
  static Failure = <E>(error: E) => RemoteData.from(I.Failure(error));
  static StandBy: RemoteData<any, any> = RemoteData.from(I.StandBy);
  static Loading: RemoteData<any, any> = RemoteData.from(I.Loading);

  get tag(): I.RemoteData<E, A>['tag'] {
    return this.internal.tag;
  }

  get data(): A | undefined {
    return I.getData(this.internal).value;
  }

  get error(): E | undefined {
    return I.getError(this.internal).value;
  }

  get remoteData(): I.RemoteData<E, A> {
    return this.internal;
  }

  private apply = <C, B>(f: (ra: I.RemoteData<E, A>) => I.RemoteData<C, B>): RemoteData<C, B> =>
    RemoteData.from(f(this.internal));

  map = <B>(fab: (a: A) => B): RemoteData<E, B> => this.apply(I.map(fab));
  mapError = <B>(feb: (e: E) => B): RemoteData<B, A> => this.apply(I.mapError(feb));
  chain = <B>(fab: (a: A) => RemoteData<E, B>): RemoteData<E, B> => RemoteData.join(this.apply(I.map(fab)));
  or = (ra: RemoteData<E, A>) => this.apply(I.orElse(ra.internal));
  orElse = (ra: RemoteData<E, A>) => this.apply(I.or(ra.internal));
  default = (a: A): RemoteData<E, A> => this.apply(I.defaultTo(a));
  fold = <B>(f: I.Fold<E, A, B>): B => I.fold(f)(this.internal);
  toMaybe = (): Maybe<A> => this.getData();
  get = (): A | undefined => this.data;
  getOrElse = (def: A) => I.getOrElse(def)(this.internal);
  getData = (): Maybe<A> => I.getData(this.internal);
  getError = (): Maybe<E> => I.getError(this.internal);
  toString = (): string => I.toString(this.internal);

  static join = <E, A>(r: RemoteData<E, RemoteData<E, A>>): RemoteData<E, A> => {
    switch (r.internal.tag) {
    case 'success':
      return r.internal.data;
    default:
      return new RemoteData(r.internal);
    }
  };

  static all = <A extends Array<RemoteData<E, any>>, E = any>(arr: A): RemoteData<E, { [P in keyof A]: RemoteDataType<A[P]> }> => {
    return arr.reduce((acc, curr): RemoteData<E, Partial<{ [P in keyof A]: RemoteDataType<A[P]> }>> => acc.chain(
      a => curr.map((v) => [...a, v ] as Partial<{ [P in keyof A]: RemoteDataType<A[P]> }>)
    ), Success([]));
  };
    
  static some = <A extends NonEmptyArray<RemoteData<E, any>>, E = any>(arr: A): RemoteData<E, RemoteDataType<A[number]>> => {
    return arr.reduce((acc, curr): RemoteData<E, RemoteDataType<A[number]>> => acc.or(curr));
  };
    
  static values = <A extends Array<RemoteData<E, any>>, E = any>(arr: A): Array<RemoteDataType<A[number]>> => {
    return arr.reduce((acc: Array<RemoteDataType<A[number]>>, curr: A[number]): Array<RemoteDataType<A[number]>> => 
      curr.fold<Array<RemoteDataType<A[number]>>>(
        {
          'stand by': () => acc,
          loading: () => acc,
          failure: () => acc,
          success: (v) => [...acc, v]
        }
      )
    , []);
  };

  static record = <R extends Record<string, RemoteData<E, any>>, E = any>(record: R): RemoteData<E, { [P in keyof R]: RemoteDataType<R[P]> }> => {
    return Object.entries(record).reduce((acc, [key, value]): RemoteData<E, Partial<{ [P in keyof R]: RemoteDataType<R[P]> }>> => {
      return acc.chain((a) => value.map((v) => ({ ...a, [key]: v })));
    }, Success({})) as unknown as RemoteData<E, { [P in keyof R]: RemoteDataType<R[P]> }>;
  };
}

export const record = RemoteData.record;
export const from = RemoteData.from;
export const join = RemoteData.join;
export const Success = RemoteData.Success;
export const Failure = RemoteData.Failure;
export const StandBy = RemoteData.StandBy;
export const Loading = RemoteData.Loading;
