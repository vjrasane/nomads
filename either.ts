import Maybe, { Just, Nothing } from './maybe';
import Result, { Err, Ok } from './result';
import { curry, FunctionInputType, FunctionOutputType, NonEmptyArray } from './src/utils';
import Tuple from './tuple';

type EitherType<R> = R extends Either<any, infer T>
? T : never;

type LeftType<R> = R extends Either<infer T, any> ? T : never;

type EitherConstructType<
A extends readonly Either<unknown, unknown>[] | Record<string | symbol | number, Either<unknown, unknown>>
> = { -readonly [P in keyof A]: EitherType<A[P]> };
interface IEither<E, A> {
  base: { tag: 'left', value: E } | { tag: 'right', value: A }
  map: <B>(fab: (a: A) => B) => Either<E, B>,
  mapLeft: <F>(fef: (e: E) => F) => Either<F, A>,
  chain: <B>(fab: (a: A) => Either<E, B>) => Either<E, B>,
  apply: (v: Either<E, FunctionInputType<A>>) => Either<E, FunctionOutputType<A>>
  join: () => A extends Either<E, infer T> ? Either<E, T> : never,
  swap: () => Either<A, E>,
  fold: <B>(f: Fold<E, A, B>) => B,
  or: (ra: Either<E, A>) => Either<E, A>,
  orElse: (ra: Either<E, A>) => Either<E, A>,
  default: (a: A) => Either<E, A>,
  toMaybe: () => Maybe<A>,
  toResult: () => Result<E, A>,
  toTuple: () => Tuple<Maybe<E>, Maybe<A>>
  get: () => A | undefined,
  getOrElse: (def: A) => A,
  getRight: () => Maybe<A>,
  getLeft: () => Maybe<E>,
  toString: () => string,
}

namespace Instance {

  abstract class AEither<E, A> implements IEither<E, A> {
    protected abstract self: Either<E, A>;

    get base(): { tag: 'left', value: E } | { tag: 'right', value: A }  {
      switch(this.self.tag) {
      case 'left':
        return { tag: 'left', value: this.self.value };
      default:
        return { tag: 'right', value: this.self.value };
      }
    }

    get = () => this.toMaybe().get();
    getOrElse = (def: A) => this.toMaybe().getOrElse(def);
    default = (def: A) => this.self.tag === 'right' ? this.self : new Right<E, A>(def);
    or = (other: Either<E, A>) => {
      switch(this.self.tag) {
      case 'right':
        return this.self;
      default:
        return other.tag === 'right' ? other : this.self;
      }
    };
    orElse = (other: Either<E, A>) => other.or(this.self);
    map = <B>(fab: (a: A) => B): Either<E, B> => this.self.tag === 'right'
      ? new Right<E, B>(fab(this.self.value))
      : new Left<E, B>(this.self.value);
    mapLeft = <F>(fef: (e: E) => F): Either<F, A> => this.self.tag === 'right'
      ? new Right<F, A>(this.self.value)
      : new Left<F, A>(fef(this.self.value));

    chain = <B>(fab: (a: A) => Either<E, B>): Either<E, B> => this.self.tag === 'right'
      ? fab(this.self.value) : new Left(this.self.value);
    apply = (ra: Either<E, FunctionInputType<A>>): Either<E, FunctionOutputType<A>> =>
    this.chain((f) => ra.map((a) => typeof f === 'function'
      ? curry(f as unknown as (...args: any[]) => any)(a)
      : a)) as Either<E, FunctionOutputType<A>>;
    join = (): A extends Either<E, infer T> ? Either<E, T> : never =>
    this.chain(
      (m) => m instanceof AEither
        ? m as unknown as A extends Either<E, infer T> ? Either<E, T> : never
        : new Right(m) as unknown as A extends Either<E, infer T> ? Either<E, T> : never
    ) as A extends Either<E, infer T> ? Either<E, T> : never;
    swap = () => this.self.tag === 'right' ? new Left<A, E>(this.self.value) : new Right<A, E>(this.self.value);
    fold = <B>(f: Fold<E, A, B>) => this.self.tag === 'right' ? f.right(this.self.value) : f.left(this.self.value);
    toMaybe = () => this.getRight();
    toResult = () => this.self.tag === 'right' ? Ok<E, A>(this.self.value) : Err<E, A>(this.self.value);
    toTuple = () => Tuple(this.getLeft(), this.getRight());
    getRight = () => this.self.tag === 'right' ? Just(this.self.value) : Nothing<A>();
    getLeft = () => this.self.tag === 'right' ? Nothing<E>() : Just(this.self.value);
    toString = () => {
      switch(this.self.tag) {
      case 'right':
        return `Right(${this.self.value})`;
      default:
        return `Left(${this.self.value})`;
      }
    };
  }

  export class Right<E, A> extends AEither<E, A> {
    readonly tag = 'right';

    constructor(readonly value: A) { super(); }

    protected self = this;
  }

  export class Left<E, A> extends AEither<E, A> {
    readonly tag = 'left';

    constructor(readonly value: E) { super(); }

    protected self = this;
  }

}

type Fold<E, A, B> = {
  right: (a: A) => B,
  left: (e: E) => B
}

export type Either<E, A> = Instance.Right<E, A> | Instance.Left<E, A>;

export const Right = <E = any, A = unknown>(value: A): Either<E, A> => new Instance.Right(value);
export const Left = <E = unknown, A = unknown>(value: E): Either<E, A> => new Instance.Left(value);

export const record = <R extends Record<string | number | symbol, Either<any, any>>>(
  record: R
): Either<LeftType<R[keyof R]>, EitherConstructType<R>> => {
  return Object.entries(record).reduce(
    (acc, [key, value]): Either<LeftType<R[keyof R]>, EitherConstructType<R>> => {
      return acc.chain(
        (a): Either<LeftType<R[keyof R]>, EitherConstructType<R>> => value.map(
          (v): EitherConstructType<R> => ({ ...a, [key]: v }))
      );
    }, Right({} as EitherConstructType<R>)
  );
};

export const all = <T extends readonly Either<any, any>[] | []>(
  arr: T
): Either<LeftType<T[number]>, EitherConstructType<T>> => {
  return (arr as readonly Either<any, any>[]).reduce(
    (acc, curr): Either<LeftType<T[number]>, EitherConstructType<T>> => acc.chain(
      (a): Either<LeftType<T[number]>, EitherConstructType<T>> => curr.map(
        (v): EitherConstructType<T> => [...(a as unknown as any[]), v] as unknown as EitherConstructType<T>)
    ), Right([] as unknown as EitherConstructType<T>)
  );
};

export const array = all;

export const applyAll = <
A extends readonly Either<any, any>[] | [],
P extends any[] & EitherConstructType<A>,
F extends (...args: P) => any
>(
    f: F,
    args: A
  ): Either<LeftType<A[number]>, ReturnType<F>> => {
  return all(args).map(
    (a): ReturnType<F> => f(...(a as Parameters<F>))
  );
};

export const some = <A extends NonEmptyArray<Either<LeftType<A[number]>, EitherType<A[number]>>>> (arr: A): A[number] =>
  arr.reduce((acc, curr) => acc.or(curr));

export const values = <A extends Array<Either<any, any>>>(arr: A): Array<EitherType<A[number]>> => {
  return arr.reduce(
    (acc: Array<EitherType<A[number]>>, curr: A[number]): Array<EitherType<A[number]>> =>
      curr.fold<Array<EitherType<A[number]>>>({
        left: () => acc,
        right: (v) => [...acc, v],
      }),
    []
  );
};

export const Either = {
  Left,
  Right,
  applyAll,
  all,
  some,
  array,
  record,
  values
} as const;

export default Either;
