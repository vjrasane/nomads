import { Err, Ok, Result } from '../result';
import { curry, FunctionInputType, FunctionOutputType } from './utils';
import { Maybe } from './maybe.api';

export type MaybeType<M> = M extends Maybe<infer T>
  ? T : never;

export type MaybeConstructType<
  A extends readonly Maybe<any>[] | Record<string | symbol | number, Maybe<any>>
> = { -readonly [P in keyof A]: MaybeType<A[P]> };

type Fold<A, B> = {
  just: (a: A) => B;
  nothing: () => B;
};

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

abstract class AMaybe<A> implements IMaybe<A> {
  protected abstract self: Maybe<A>;

  get base(): { tag: 'just', value: A } | { tag: 'nothing'}  {
    switch(this.self.tag) {
      case "just":
        return { tag: 'just', value: this.self.value };
        default:
          return { tag: "nothing" }
    }
  }

  get = () => this.self.tag === "just" ? this.self.value : undefined;
  getOrElse = (def: A) => this.self.tag === "just" ? this.self.value : def;
  default = (a: A) => this.self.tag === "just" ? this.self : new Just(a);
  or = (other: Maybe<A>) => this.self.tag === "just" ? this.self : other;
  orElse = (other: Maybe<A>) => other.or(this.self);
  filter = (f: (a: A) => boolean): Maybe<A> => this.chain(
    (a: A) => f(a) ? this.self : new Nothing()
  )
  fold = <B>(f: Fold<A, B>) => this.self.tag === "just" ? f.just(this.self.value) : f.nothing();
  map = <B>(fab: (a: A) => B): Maybe<B> => this.self.tag === "just" 
    ? new Just(fab(this.self.value)) 
    : new Nothing();
  chain = <B>(fab: (a: A) => Maybe<B>): Maybe<B> => this.self.tag === "just" 
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
  toResult = <E>(err: E): Result<E, A> => this.self.tag === "just" ? Ok(this.self.value) : Err(err);
  concatTo = <T>(arr: Array<A | T>): Array<A | T> => this.map((v) => [v, ...arr]).getOrElse(arr);
  appendTo = <T>(arr: Array<A | T>): Array<A | T> => this.map((v) => [...arr, v]).getOrElse(arr);
  toString = () => {
    switch(this.self.tag) {
      case "just":
        return `Just(${this.self.value})`;
      default:
        return "Nothing";
    }
  };
}



export class Just<A> extends AMaybe<A> {
  readonly tag = 'just';
  constructor(readonly value: A) { super(); } 

  protected self = this;
}

export class Nothing<A> extends AMaybe<A> {
  readonly tag = "nothing";

  protected self = this;
}