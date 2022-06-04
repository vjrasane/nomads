import { Err, Ok, Result } from '../result';
import { curry, FunctionInputType, FunctionOutputType } from './function';
import { Maybe } from './maybe';
import { Optional } from './optional';
import { isType } from './type';

type Fold<A, B> = {
  just: (a: A) => B;
  nothing: () => B;
};

interface IMaybe<A> {
  base: { tag: 'just', value: A } | { tag: 'nothing'}
  get: () => Optional<A>;
  getOrElse: (def: A) => A;
  default: (m: A) => Maybe<A>;
  map: <B>(fab: (a: A) => B) => Maybe<B>;
  chain: <B>(fab: (a: A) => Maybe<B>) => Maybe<B>;
  apply: (v: Maybe<FunctionInputType<A>>) => Maybe<FunctionOutputType<A>>;
  join: () => A extends Maybe<infer T> ? Maybe<T> : never,
  or: (m: Maybe<A>) => Maybe<A>;
  orElse: (m: Maybe<A>) => Maybe<A>;
  filter: (f: (a: A) => boolean) => Maybe<A>;
  fold: <B>(f: Fold<A, B>) => B;
  // getOrElse: (def: A) => A;
  toResult: <E>(err: E) => Result<E, A>;
  // toString: () => string;
  // concatTo: <T>(arr: Array<T | A>) => Array<T | A>;
  // appendTo: <T>(arr: Array<T | A>) => Array<T | A>;
}

const Brand: unique symbol = Symbol('Maybe');

export class Just<A> implements IMaybe<A> {
  readonly [Brand] = Brand;
  readonly tag: 'just';
  constructor(readonly value: A) {}

  get base():  { tag: 'just', value: A }  {
    return { tag: 'just', value: this.value };
  }

  get = () => this.value;
  getOrElse = () => this.value;
  default = () => this;
  or = () => this;
  filter = (f: (a: A) => boolean): Maybe<A> => f(this.value) ? this : new Nothing<A>();
  fold = <B>(f: Fold<A, B>) => f.just(this.value);
  orElse = (other: Maybe<A>) => other.or(this);
  map = <B>(fab: (a: A) => B): Maybe<B> => new Just(fab(this.value));
  chain = <B>(fab: (a: A) => Maybe<B>): Maybe<B> => fab(this.value);
  apply = (ma: Maybe<FunctionInputType<A>>): Maybe<FunctionOutputType<A>> =>
    this.chain((f) => ma.map((a) => typeof f === 'function'
      ? curry(f as unknown as (...args: any[]) => any)(a)
      : a)) as Maybe<FunctionOutputType<A>>;
  join = (): A extends Maybe<infer T> ? Maybe<T> : never =>
      this.chain(
        (m) => isType<Maybe<any>>(Brand, m)
          ? m as unknown as A extends Maybe<infer T> ? Maybe<T> : never
          : new Just(m) as unknown as A extends Maybe<infer T> ? Maybe<T> : never
      ) as A extends Maybe<infer T> ? Maybe<T> : never;
  toResult = <E>(): Result<E, A> => Ok(this.value);
}

export class Nothing<A> implements IMaybe<A> {
  readonly [Brand] = Brand;
  readonly tag: 'nothing';
  get base():  { tag: 'nothing'}  {
    return { tag: 'nothing' };
  }

  get = () => undefined;
  getOrElse = (def: A) => def;
  default = (a: A) => new Just(a);
  filter = (): Maybe<A> => new Nothing();
  fold = <B>(f: Fold<A, B>) => f.nothing();
  or = (other: Maybe<A>) => other;
  orElse = (other: Maybe<A>) => other.or(this);
  map = <B>() => new Nothing<B>();
  chain = <B>() => new Nothing<B>();
  apply = (): Maybe<FunctionOutputType<A>> => new Nothing();
  join = () => this as unknown as A extends Maybe<infer T> ? Maybe<T> : never;
  toResult = <E>(err: E): Result<E, A> => Err(err);
}