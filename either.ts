import { Err, Ok, Result } from './result';
import { Just, Maybe, Nothing } from './maybe';
import { Tuple } from './tuple';
import { curry, FunctionInputType, FunctionOutputType, isType, NonEmptyArray } from './src/common';

namespace I {

type Left<A> = {
  readonly tag: 'left';
  readonly value: A;
};

type Right<A> = {
  readonly tag: 'right';
  readonly value: A;
};

export type Either<A, B> = Left<A> | Right<B>;

export const Right = <A>(value: A): Either<any, A> => ({ tag: 'right', value });
export const Left = <A>(value: A): Either<A, any> => ({ tag: 'left', value });

export const map =
  <A, B, C>(fbc: (a: B) => C) =>
    (e: Either<A, B>): Either<A, C> => {
      switch (e.tag) {
      case 'right':
        return Right(fbc(e.value));
      default:
        return e;
      }
    };

export const mapLeft =
  <A, B, C>(fac: (a: A) => C) =>
    (e: Either<A, B>): Either<C, B> => {
      switch (e.tag) {
      case 'right':
        return e;
      default:
        return Left(fac(e.value));
      }
    };


export const or =
<E, A>(first: Either<E, A>) =>
  (second: Either<E, A>): Either<E, A> => {
    switch (second.tag) {
    case 'right':
      return first.tag === 'right' ? first : second;
    default:
      return first;
    }
  };

export const orElse =
<E, A>(first: Either<E, A>) =>
  (second: Either<E, A>): Either<E, A> =>
    or(second)(first);

  
export const getOrElse =
<E, A>(def: A) =>
  (r: Either<E, A>): A => {
    switch (r.tag) {
    case 'right':
      return r.value;
    default:
      return def;
    }
  };


export const defaultTo =
<E, A>(def: A) =>
  (r: Either<E, A>): Either<E, A> => {
    switch (r.tag) {
    case 'right':
      return r;
    default:
      return Right(def);
    }
  };

export type Fold<A, B, C> = {
  left: (a: A) => C,
  right: (b: B) => C
}

export const fold =
  <A, B, C>(f: Fold<A, B, C>) =>
    (e: Either<A, B>): C => {
      switch (e.tag) {
      case 'left':
        return f.left(e.value);
      default:
        return f.right(e.value);
      }
    };

export const swap = <A, B>(e: Either<A, B>): Either<B, A> => {
  switch (e.tag) {
  case 'right':
    return Left(e.value);
  default:
    return Right(e.value);
  }
};

export const getLeft = <A, B>(e: Either<A, B>): Maybe<A> => {
  switch (e.tag) {
  case 'left':
    return Just(e.value);
  case 'right':
    return Nothing;
  }
};

export const getRight = <A, B>(e: Either<A, B>): Maybe<B> => {
  switch (e.tag) {
  case 'right':
    return Just(e.value);
  default:
    return Nothing;
  }
};

export const toString = <A, B>(e: Either<A, B>): string => {
  switch (e.tag) {
  case 'right':
    return `Right(${e.value})`;
  default:
    return `Left(${e.value})`;
  }
};

export const toResult = <A, B>(e: Either<A, B>): Result<A, B> => {
  switch (e.tag) {
  case 'right':
    return Ok(e.value);
  default:
    return Err(e.value);
  }
};


export const toTuple = <A, B>(e: Either<A, B>): Tuple<Maybe<A>, Maybe<B>> => {
  return Tuple.of(getLeft(e), getRight(e));
};

}

const Brand: unique symbol = Symbol("Either");
export interface Either<A, B> {
  readonly [Brand]: typeof Brand,
  readonly either: I.Either<A, B>,
  readonly tag: I.Either<A, B>['tag'],
  readonly value: A | B,
  readonly left: A | undefined,
  readonly right: B | undefined,
  map: <C>(fbc: (b: B) => C) => Either<A, C>,
  mapLeft: <C>(fac: (a: A) => C) => Either<C, B>,
  chain: <C>(fbc: (b: B) => Either<A, C>) => Either<A, C>,
  apply: (v: Either<A, FunctionInputType<B>>) => Either<A, FunctionOutputType<B>>
  join: () => B extends Either<A, infer T> ? Either<A, T> : never,
  fold: <C>(f: I.Fold<A, B, C>) => C,
  or: (ra: Either<A, B>) => Either<A, B>,
  orElse: (ra: Either<A, B>) => Either<A, B>,
  default: (b: B) => Either<A, B>,
  swap: () => Either<B, A>,
  toResult: () => Result<A, B>,
  toMaybe: () => Maybe<B>,
  toTuple: () => Tuple<Maybe<A>, Maybe<B>>
  get: () => B | undefined,
  getOrElse: (def: B) => B,
  getLeft: () => Maybe<A>,
  getRight: () => Maybe<B>,
  toString: () => string,
}

type EitherRightType<E> = E extends Either<any, infer T> ? T : never;
type EitherLeftType<E> = E extends Either<infer T, any> ? T : never;
type EitherTypeConstruct<A extends readonly Either<any, any>[] | Record<string | symbol | number, Either<any, any>>> =  { -readonly [P in keyof A]: EitherRightType<A[P]> };

const EitherConstructor = <A, B>(either: I.Either<A, B>): Either<A, B> => ({
  [Brand]: Brand,
  either,
  tag: either.tag,
  value: either.value,
  left: I.getLeft(either).value,
  right: I.getRight(either).value,
  map: (fab) => map(fab, either),
  mapLeft: <C>(fac: (a: A) => C) => EitherConstructor(I.mapLeft<A, B, C>(fac)(either)),
  chain: (fab) => chain(fab, either),
  join: () => join(either),
  apply: (v) => chain(apply(v), either),
  fold: (f) => I.fold(f)(either),
  or: (other) => EitherConstructor(I.or(either)(other.either)),
  orElse: (other) => EitherConstructor(I.orElse(either)(other.either)),
  default: (def) => EitherConstructor(I.defaultTo<A, B>(def)(either)),
  swap: () => EitherConstructor(I.swap(either)),
  toResult: () => I.toResult(either),
  toMaybe: () => I.getRight(either),
  toTuple: () => I.toTuple(either),
  get: () => I.getRight(either).value,
  getOrElse: (def) => I.getOrElse(def)(either),
  getLeft: () => I.getLeft(either),
  getRight: () => I.getRight(either),
  toString: () => I.toString(either)
})

const map = <E, A, B>(fab: (a: A) => B, e: I.Either<E, A>): Either<E, B> => EitherConstructor(I.map<E, A, B>(fab)(e));
const chain = <E, A, B>(fab: (a: A) => Either<E, B>, e: I.Either<E, A>): Either<E, B> => {
  switch(e.tag) {
  case 'right':
    return fab(e.value);
  default:
    return EitherConstructor<E, B>(e);
  }
};
const join = 
  <A, B>(e: I.Either<A, B>): B extends Either<A, infer T> ? Either<A, T> : never => {
    return chain(
      ee => isType<Either<A, any>>(Brand, ee) ? ee : Right(ee), e
    ) as B extends Either<A, infer T> ? Either<A, T> : never;
  }

const apply = <A, B>(a: Either<A, FunctionInputType<B>>) => (f: B): Either<A, FunctionOutputType<B>> => a.map(
  (v) => typeof f === 'function' ? curry(f as unknown as (...args: any[]) => any)(v) : v
);


export const Right = <A>(value: A): Either<any, A> => EitherConstructor(I.Right(value));
export const Left = <E>(value: E): Either<E, any> => EitherConstructor(I.Left(value));

export const applyAll = <A extends readonly Either<any, any>[] | [], P extends any[] & EitherTypeConstruct<A>, F extends (...args: P) => any>(f: F, args: A): Either<EitherLeftType<A[keyof A]>, ReturnType<F>> => {
  return Either.all(args) .map((args) => f(...args as Parameters<F>)) as Either<EitherLeftType<A[keyof A]>, ReturnType<F>>;
};

export const all = <T extends readonly Either<any, any>[] | []>(arr: T): Either<EitherLeftType<T[keyof T]>, EitherRightType<T>> => {
  return (arr as readonly Either<EitherLeftType<T[keyof T]>, any>[]).reduce(
    (acc: Either<EitherLeftType<T[keyof T]>, EitherTypeConstruct<T>>, curr): Either<EitherLeftType<T[keyof T]>, EitherTypeConstruct<T>> => acc.chain(
      a => curr.map((v) => [...(a as readonly unknown[]), v ]  as unknown as EitherTypeConstruct<T>)
    ), Right([]));
};
    
export const some = <A extends NonEmptyArray<Either<E, any>>, E = any>(arr: A): Either<E, EitherRightType<A[number]>> => {
  return arr.reduce((acc, curr): Either<E, EitherRightType<A[number]>> => acc.or(curr));
};
    
export const values = <A extends Array<Either<any, any>>>(arr: A): Array<EitherRightType<A[number]>> => {
  return arr.reduce((acc: Array<EitherRightType<A[number]>>, curr: A[number]): Array<EitherRightType<A[number]>> => 
    curr.fold<Array<EitherRightType<A[number]>>>({
      left: () => acc,
      right: v => [...acc, v]
    })
  , []);
};
  
export const array = all;

export const record = <R extends Record<string, Either<any, any>>>(record: R): Either<EitherLeftType<R[keyof R]>, EitherTypeConstruct<R>> => {
  return Object.entries(record).reduce((acc, [key, value]): Either<EitherLeftType<R[keyof R]>, Partial<EitherTypeConstruct<R>>> => {
    return acc.chain((a) => value.map((v) => ({ ...a, [key]: v })));
  }, Right({})) as unknown as Either<EitherLeftType<R[keyof R]>, EitherTypeConstruct<R>>;
};

export const Either = {
  Right,
  Left,
  applyAll,
  all,
  some,
  array,
  record,
  values
} as const;
