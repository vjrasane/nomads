import { Either } from '../either';
import { Maybe } from '../maybe';
import { NonEmptyArray } from '../non-empty-array';
import * as I from './internal';

type ResultType<R> = R extends Result<any, infer T> ? T : never;

export class Result<E, A> {
  private constructor(private readonly internal: I.Result<E, A>) {}

  static from = <E, A>(r: I.Result<E, A>) => new Result<E, A>(r);
  static Ok = <A>(value: A) => Result.from(I.Ok(value));
  static Err = <E>(error: E) => Result.from(I.Err(error));

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
  mapError = <B>(feb: (e: E) => B): Result<B, A> => this.apply(I.mapError(feb));
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

  static all = <A extends Array<Result<E, any>>, E = any>(arr: A): Result<E, { [P in keyof A]: ResultType<A[P]> }> => {
    return arr.reduce((acc, curr): Result<E, Partial<{ [P in keyof A]: ResultType<A[P]> }>> => acc.chain(
      a => curr.map((v) => [...a, v ] as Partial<{ [P in keyof A]: ResultType<A[P]> }>)
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
  
  static record = <R extends Record<string, Result<E, any>>, E = any>(record: R): Result<E, { [P in keyof R]: ResultType<R[P]> }> => {
    return Object.entries(record).reduce((acc, [key, value]): Result<E, Partial<{ [P in keyof R]: ResultType<R[P]> }>> => {
      return acc.chain((a) => value.map((v) => ({ ...a, [key]: v })));
    }, Ok({})) as unknown as Result<E, { [P in keyof R]: ResultType<R[P]> }>;
  };
}

export const record = Result.record;
export const from = Result.from;
export const join = Result.join;
export const applyTo = Result.applyTo;
export const Ok = Result.Ok;
export const Err = Result.Err;
