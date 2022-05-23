import { Either, Left, Right } from './either';
import { Just, Maybe, Nothing } from './maybe';
import { NonEmptyArray } from './non-empty-array';

namespace I {

type Ok<A> = {
  readonly tag: 'ok';
  readonly value: A;
};

type Err<E> = {
  readonly tag: 'err';
  readonly error: E;
};

export type Result<E, A> = Ok<A> | Err<E>;

export const Ok = <A>(value: A): Result<any, A> => ({ tag: 'ok', value });
export const Err = <E>(error: E): Result<E, any> => ({ tag: 'err', error });

export const map =
  <E, A, B>(fab: (a: A) => B) =>
    (ra: Result<E, A>): Result<E, B> => {
      switch (ra.tag) {
      case 'ok':
        return Ok(fab(ra.value));
      default:
        return ra;
      }
    };

export const mapError =
  <E, A, B>(feb: (e: E) => B) =>
    (ra: Result<E, A>): Result<B, A> => {
      switch (ra.tag) {
      case 'ok':
        return ra;
      default:
        return Err(feb(ra.error));
      }
    };

export type Fold<E, A, B> = {
  ok: (a: A) => B,
  err: (e: E) => B
}

export const fold =
  <E, A, B>(f: Fold<E, A, B>) =>
    (ra: Result<E, A>): B => {
      switch (ra.tag) {
      case 'ok':
        return f.ok(ra.value);
      default:
        return f.err(ra.error);
      }
    };

export const or =
  <E, A>(first: Result<E, A>) =>
    (second: Result<E, A>): Result<E, A> => {
      switch (second.tag) {
      case 'ok':
        return first.tag === 'ok' ? first : second;
      default:
        return first;
      }
    };

export const orElse =
  <E, A>(first: Result<E, A>) =>
    (second: Result<E, A>): Result<E, A> =>
      or(second)(first);

export const defaultTo =
  <E, A>(def: A) =>
    (r: Result<E, A>): Result<E, A> => {
      switch (r.tag) {
      case 'ok':
        return r;
      default:
        return Ok(def);
      }
    };

export const toEither = <E, A>(r: Result<E, A>): Either<E, A> => {
  switch (r.tag) {
  case 'ok':
    return Right(r.value);
  default:
    return Left(r.error);
  }
};

export const getError = <E, A>(r: Result<E, A>): Maybe<E> => {
  switch (r.tag) {
  case 'ok':
    return Nothing;
  default:
    return Just(r.error);
  }
};

export const getOrElse =
  <E, A>(def: A) =>
    (r: Result<E, A>): A => {
      switch (r.tag) {
      case 'ok':
        return r.value;
      default:
        return def;
      }
    };

export const getValue = <E, A>(r: Result<E, A>): Maybe<A> => {
  switch (r.tag) {
  case 'ok':
    return Just(r.value);
  default:
    return Nothing;
  }
};

export const toString = <E, A>(r: Result<E, A>): string => {
  switch (r.tag) {
  case 'ok':
    return `Ok(${r.value})`;
  default:
    return `Err(${r.error})`;
  }
};

}

type ResultType<R> = R extends Result<any, infer T> ? T : never;

export class Result<E, A> {
  private constructor(private readonly internal: I.Result<E, A>) {}

  static from = <E, A>(r: I.Result<E, A>) => new Result<E, A>(r);
  static Ok = <A>(value: A): Result<any, A> => Result.from(I.Ok(value));
  static Err = <E>(error: E): Result<E, any> => Result.from(I.Err(error));

  get tag(): I.Result<E, A>['tag'] {
    return this.internal.tag;
  }

  get value(): A | undefined {
    return I.getValue(this.internal).value;
  }

  get error(): E | undefined {
    return I.getError(this.internal).value;
  }

  get result(): I.Result<E, A> {
    return this.internal;
  }

  private apply = <C, B>(f: (ra: I.Result<E, A>) => I.Result<C, B>): Result<C, B> => new Result(f(this.internal));

  map = <B>(fab: (a: A) => B): Result<E, B> => this.apply(I.map(fab));
  mapError = <F>(fef: (e: E) => F): Result<F, A> => this.apply(I.mapError(fef));
  chain = <B>(fab: (a: A) => Result<E, B>): Result<E, B> => Result.join(this.apply(I.map(fab)));
  fold = <B>(f: I.Fold<E, A, B>): B => I.fold(f)(this.internal);
  or = (ra: Result<E, A>) => this.apply(I.orElse(ra.internal));
  orElse = (ra: Result<E, A>) => this.apply(I.or(ra.internal));
  default = (a: A): Result<E, A> => this.apply(I.defaultTo(a));
  toEither = (): Either<E, A> => I.toEither(this.internal);
  toMaybe = (): Maybe<A> => this.getValue();
  get = (): A | undefined => this.value;
  getOrElse = (def: A) => I.getOrElse(def)(this.internal);
  getValue = (): Maybe<A> => I.getValue(this.internal);
  getError = (): Maybe<E> => I.getError(this.internal);
  toString = (): string => I.toString(this.internal);

  static join = <E, A>(r: Result<E, Result<E, A>>): Result<E, A> => {
    switch (r.internal.tag) {
    case 'ok':
      return r.internal.value;
    default:
      return new Result(r.internal);
    }
  };

  static applyTo =
    <A, B, E>(r: Result<E, A>) =>
    (f: (a: A) => B): Result<E, B> =>
      r.map(f);

  static all = <T extends readonly Result<E, any>[] | [], E = any>(arr: T): Result<E, { -readonly [P in keyof T]: ResultType<T[P]> }> => {
    return (arr as readonly Result<E, any>[]).reduce(
      (acc: Result<E, { -readonly [P in keyof T]: ResultType<T[P]> }>, curr): Result<E, { -readonly [P in keyof T]: ResultType<T[P]> }> => acc.chain(
        a => curr.map((v) => [...(a as readonly unknown[]), v ]  as unknown as { -readonly [P in keyof T]: ResultType<T[P]> })
      ), Ok([]));
  };
    
  static some = <A extends NonEmptyArray<Result<E, any>>, E = any>(arr: A): Result<E, ResultType<A[number]>> => {
    return arr.reduce((acc, curr): Result<E, ResultType<A[number]>> => acc.or(curr));
  };
    
  static values = <A extends Array<Result<E, any>>, E = any>(arr: A): Array<ResultType<A[number]>> => {
    return arr.reduce((acc: Array<ResultType<A[number]>>, curr: A[number]): Array<ResultType<A[number]>> => 
      curr.fold<Array<ResultType<A[number]>>>({
        err: () => acc,
        ok: v => [...acc, v]
      })
    , []);
  };
  
  static array = Result.all;

  static record = <R extends Record<string, Result<E, any>>, E = any>(record: R): Result<E, { [P in keyof R]: ResultType<R[P]> }> => {
    return Object.entries(record).reduce((acc, [key, value]): Result<E, Partial<{ [P in keyof R]: ResultType<R[P]> }>> => {
      return acc.chain((a) => value.map((v) => ({ ...a, [key]: v })));
    }, Ok({})) as unknown as Result<E, { [P in keyof R]: ResultType<R[P]> }>;
  };
}

export const array = Result.array;
export const all = Result.all;
export const record = Result.record;
export const from = Result.from;
export const join = Result.join;
export const applyTo = Result.applyTo;
export const Ok = Result.Ok;
export const Err = Result.Err;
