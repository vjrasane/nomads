import { Just, Maybe, Nothing } from '../maybe';

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
