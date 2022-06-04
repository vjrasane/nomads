import { Err, Ok, Result } from '../result';
import { curry, FunctionInputType, FunctionOutputType } from './function';
import { Maybe } from './maybe';

type Fold<A, B> = {
  just: (a: A) => B;
  nothing: () => B;
};

interface IMaybe<A> {
  base: { tag: 'just', value: A } | { tag: 'nothing'}
  get: () => A | undefined;
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
  toResult: <E>(err: E) => Result<E, A>;
  toString: () => string;
  concatTo: <T>(arr: Array<T | A>) => Array<T | A>;
  appendTo: <T>(arr: Array<T | A>) => Array<T | A>;
}

// const Brand: unique symbol = Symbol('Maybe');
abstract class AMaybe<A> implements IMaybe<A> {
  // abstract base: { tag: 'nothing'; } | { tag: 'just'; value: A; };
  // abstract get: () => A | undefined;
  // abstract getOrElse: (def: A) => A;
  // abstract  default: (m: A) => Maybe<A>;
  // abstract   map: <B>(fab: (a: A) => B) => Maybe<B>;
  // abstract   chain: <B>(fab: (a: A) => Maybe<B>) => Maybe<B>;
  // abstract  apply: (v: Maybe<FunctionInputType<A>>) => Maybe<FunctionOutputType<A>>;
  // abstract  join: () => A extends Maybe<infer T> ? Maybe<T> : never;
  // abstract   or: (m: Maybe<A>) => Maybe<A>;
  // abstract  orElse: (m: Maybe<A>) => Maybe<A>;
  // abstract  filter: (f: (a: A) => boolean) => Maybe<A>;
  // abstract  fold: <B>(f: Fold<A, B>) => B;
  // abstract  toResult: <E>(err: E) => Result<E, A>;
  // abstract  toString: () => string;
  // abstract  concatTo: <T>(arr: (A | T)[]) => (A | T)[];
  // abstract  appendTo: <T>(arr: (A | T)[]) => (A | T)[];
  // readonly [Brand] = Brand;
  
  abstract maybe: Maybe<A>;

  get base(): { tag: 'just', value: A } | { tag: 'nothing'}  {
    switch(this.maybe.tag) {
      case "just":
        return { tag: 'just', value: this.maybe.value };
        default:
          return { tag: "nothing" }
    }
  }

  get = () => this.maybe.tag === "just" ? this.maybe.value : undefined;
  getOrElse = (def: A) => this.maybe.tag === "just" ? this.maybe.value : def;
  default = (a: A) => this.maybe.tag === "just" ? this.maybe : new Just(a);
  or = (other: Maybe<A>) => this.maybe.tag === "just" ? this.maybe : other;
  orElse = (other: Maybe<A>) => other.or(this.maybe);
  filter = (f: (a: A) => boolean): Maybe<A> => {
    switch(this.maybe.tag) {
      case "just":
        return f(this.maybe.value) ? this.maybe : new Nothing();
      default:
        return this.maybe;
    } 
  }
  fold = <B>(f: Fold<A, B>) => {
    switch(this.maybe.tag) {
      case "just":
        return f.just(this.maybe.value);
      default:
        return f.nothing();
    } 
  }
  map = <B>(fab: (a: A) => B): Maybe<B> => this.maybe.tag === "just" 
    ? new Just(fab(this.maybe.value)) 
    : new Nothing();
  chain = <B>(fab: (a: A) => Maybe<B>): Maybe<B> => this.maybe.tag === "just" 
  ? fab(this.maybe.value) : new Nothing();
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
  toResult = <E>(err: E): Result<E, A> => {
    switch(this.maybe.tag) {
      case "just":
        return Ok(this.maybe.value);
      default:
        return Err(err)
    }
  }
  concatTo = <T>(arr: Array<A | T>): Array<A | T> => this.map((v) => [v, ...arr]).getOrElse(arr);
  appendTo = <T>(arr: Array<A | T>): Array<A | T> => this.map((v) => [...arr, v]).getOrElse(arr);
  toString = () => {
    switch(this.maybe.tag) {
      case "just":
        return `Just(${this.maybe.value})`;
      default:
        return "Nothing";
    }
  };
}



export class Just<A> extends AMaybe<A> {
  readonly tag = 'just';
  constructor(readonly value: A) { super(); } 

  get maybe() { return this; }

  // get base():  { tag: 'just', value: A }  {
  //   return { tag: 'just', value: this.value };
  // }

  // get = () => this.value;
  // getOrElse = () => this.value;
  // default = (): Maybe<A> => this;
  // or = () => this;
  // filter = (f: (a: A) => boolean): Maybe<A> => f(this.value) ? this : new Nothing<A>();
  // fold = <B>(f: Fold<A, B>) => f.just(this.value);
  // orElse = (other: Maybe<A>) => other.or(this);
  // map = <B>(fab: (a: A) => B): Maybe<B> => new Just(fab(this.value));
  // chain = <B>(fab: (a: A) => Maybe<B>): Maybe<B> => fab(this.value);
  // apply = (ma: Maybe<FunctionInputType<A>>): Maybe<FunctionOutputType<A>> =>
  //   this.chain((f) => ma.map((a) => typeof f === 'function'
  //     ? curry(f as unknown as (...args: any[]) => any)(a)
  //     : a)) as Maybe<FunctionOutputType<A>>;
  // join = (): A extends Maybe<infer T> ? Maybe<T> : never =>
  //     this.chain(
  //       (m) => isType<Maybe<any>>(Brand, m)
  //         ? m as unknown as A extends Maybe<infer T> ? Maybe<T> : never
  //         : new Just(m) as unknown as A extends Maybe<infer T> ? Maybe<T> : never
  //     ) as A extends Maybe<infer T> ? Maybe<T> : never;
  // toResult = <E>(): Result<E, A> => Ok(this.value);
  // concatTo = <T>(arr: Array<A | T>): Array<A | T> => this.map((v) => [v, ...arr]).getOrElse(arr);
  // appendTo = <T>(arr: Array<A | T>): Array<A | T> => this.map((v) => [...arr, v]).getOrElse(arr);
  // toString = () => `Just(${this.value})`;
}

export class Nothing<A> extends AMaybe<A> {
 
  // get: () => A;
  // getOrElse: (def: A) => A;
  // default: (m: A) => Maybe<A>;
  // map: <B>(fab: (a: A) => B) => Maybe<B>;
  // chain: <B>(fab: (a: A) => Maybe<B>) => Maybe<B>;
  // apply: (v: Maybe<FunctionInputType<A>>) => Maybe<FunctionOutputType<A>>;
  // join: () => A extends Maybe<infer T> ? Maybe<T> : never;
  // or: (m: Maybe<A>) => Maybe<A>;
  // orElse: (m: Maybe<A>) => Maybe<A>;
  // filter: (f: (a: A) => boolean) => Maybe<A>;
  // fold: <B>(f: Fold<A, B>) => B;
  // toResult: <E>(err: E) => Result<E, A>;
  // readonly [Brand] = Brand;
  readonly tag = "nothing";

  get maybe() { return this; }
  // get base():  { tag: 'nothing'}  {
  //   return { tag: 'nothing' };
  // }

  // get = () => undefined;
  // getOrElse = (def: A) => def;
  // default = (a: A): Maybe<A> => new Just(a);
  // filter = (): Maybe<A> => new Nothing();
  // fold = <B>(f: Fold<A, B>) => f.nothing();
  // or = (other: Maybe<A>) => other;
  // orElse = (other: Maybe<A>) => other.or(this);
  // map = <B>() => new Nothing<B>();
  // chain = <B>() => new Nothing<B>();
  // apply = (): Maybe<FunctionOutputType<A>> => new Nothing();
  // join = () => this as unknown as A extends Maybe<infer T> ? Maybe<T> : never;
  // toResult = <E>(err: E): Result<E, A> => Err(err);
  // concatTo = <T>(arr: Array<A | T>): Array<A | T> => arr
  // appendTo = <T>(arr: Array<A | T>): Array<A | T> => arr
  // toString = () => "Nothing"
}