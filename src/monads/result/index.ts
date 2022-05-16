import { Either } from '../either';
import { Maybe } from '../maybe';
import * as I from './internal';

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
  fold = <B>(feb: (e: E) => B, fab: (a: A) => B): B => I.fold(feb, fab)(this.internal);
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
}

export const from = Result.from;
export const join = Result.join;
export const applyTo = Result.applyTo;
export const Ok = Result.Ok;
export const Err = Result.Err;
