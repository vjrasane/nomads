import { Either, Left, Right } from './either';
import { Just, Maybe, Nothing } from './maybe';
import { curry, FunctionInputType, FunctionOutputType } from './src/function';
import { NonEmptyArray } from './src/optional';
import { isType } from './src/type';


const Brand: unique symbol = Symbol('Result');

type UnwrapConstruct<A extends readonly I.Result<any, any>[] | Record<string | symbol | number, I.Result<any, any>>> =  { -readonly [P in keyof A]: ResultType<A[P]> };

type WrapArray<A extends readonly any[]> =  { -readonly [P in keyof A]: I.Result<any, A[P]> };

namespace I {

type Ok<A> = {
  readonly tag: 'ok';
  readonly value: A;
};

type Err<E> = {
  readonly tag: 'err';
  readonly error: E;
};

export type Result<E, A> = (Ok<A> | Err<E>) & { [Brand]: typeof Brand };

export const Ok = <E, A>(value: A): Result<E, A> => ({ tag: 'ok', value, [Brand]: Brand });
export const Err = <E, A>(error: E): Result<E, A> => ({ tag: 'err', error, [Brand]: Brand });

export const map =
  <E, A, B>(fab: (a: A) => B, ra: Result<E, A>): Result<E, B> => {
    switch (ra.tag) {
    case 'ok':
      return Ok(fab(ra.value));
    default:
      return ra;
    }
  };

export const mapError =
  <E, A, B>(feb: (e: E) => B, ra: Result<E, A>): Result<B, A> => {
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
  <E, A, B>(f: Fold<E, A, B>, ra: Result<E, A>): B => {
    switch (ra.tag) {
    case 'ok':
      return f.ok(ra.value);
    default:
      return f.err(ra.error);
    }
  };

export const or =
  <E, A>(first: Result<E, A>, second: Result<E, A>): Result<E, A> => {
    switch (second.tag) {
    case 'ok':
      return first.tag === 'ok' ? first : second;
    default:
      return first;
    }
  };

export const orElse =
  <E, A>(first: Result<E, A>, second: Result<E, A>): Result<E, A> =>
    or(second, first);

export const defaultTo =
  <E, A>(def: A, r: Result<E, A>): Result<E, A> => 
    or(r, Ok(def));

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
    return Nothing();
  default:
    return Just(r.error);
  }
};

export const getOrElse =
  <E, A>(def: A, r: Result<E, A>): A => {
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
    return Nothing();
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


export const chain = 
<E, A, B>(fab: (a: A) => Result<E, B>, m: Result<E, A>) => {
  switch(m.tag) {
  case 'ok':
    return fab(m.value);
  default:
    return m;
  }
};


export const join = 
<E, A>(m: Result<E, A>): A extends Result<E, infer T> ? Result<E, T> : never => {
  return chain(
    mm => isType<Result<any, any>>(Brand, mm) ? mm : Ok(mm),
    m) as A extends Result<E, infer T> ? Result<E, T> : never;
};

export const apply =
<E, A>(ra: I.Result<E, FunctionInputType<A>>, rf: I.Result<E, A>): I.Result<E, FunctionOutputType<A>> =>
    I.chain(
      (f) => I.map(
        (a) => typeof f === 'function'
          ? curry(f as unknown as (...args: any[]) => any)(a)
          : a, 
        ra),
      rf);
  
    export const record = <R extends Record<string, Result<any, any>>>(
      record: R
    ): Result<ErrorType<R[keyof R]>, ResultTypeConstruct<R>> => {
      return Object.entries(record).reduce(
        (acc, [key, value]) => chain((a) => map((v) => ({ ...a, [key]: v }), value), acc)
        , Ok({})) as unknown as Result<ErrorType<R[keyof R]>, ResultTypeConstruct<R>>;
    };
          
    export const all = <T extends readonly Result<any, any>[] | []>(
      arr: T
    ): Result<ErrorType<T[keyof T]>, ResultTypeConstruct<T>> => {
      return (arr as readonly Result<any, any>[]).reduce(
        (acc, curr): Result<ErrorType<T[keyof T]>, ResultTypeConstruct<T>> => {
          return chain(
            (a) => map(
              (v) => [...a, v] as unknown as ResultTypeConstruct<T>, 
              curr),
            acc);
        },
        Ok([])
      );
    };
  
    export const some = <A extends NonEmptyArray<Result<any, any>>>(
      arr: A
    ): Result<ErrorType<A[number]>, ResultType<A[number]>> => {
      return arr.reduce(
        (acc, curr): Result<ErrorType<A[number]>, ResultType<A[number]>> => or(acc, curr)
      );
    };
  
  
    export const values = <A extends Array<Result<any, any>>>(
      arr: A
    ): Array<ResultType<A[number]>> => {
      return arr.reduce(
        (acc: Array<ResultType<A[number]>>, curr: A[number]): Array<ResultType<A[number]>> =>
          fold<ErrorType<A[number]>, ResultType<A[number]>, Array<ResultType<A[number]>>>({
            err: () => acc,
            ok: (v) => [...acc, v],
          }, curr),
        []
      );
    };
  
    export const applyAll = <
    A extends readonly Result<any, any>[] | [],
    P extends any[] & ResultTypeConstruct<A>,
    F extends (...args: P) => any
    // F extends (...args: P) => any,
    // A extends ,
    // P extends any[] & ResultTypeConstruct<A>
  >(
        f: F,
        args: A
      ): Result<ErrorType<A[number]>, ReturnType<F>> => {
      return map((args) => f(...(args as Parameters<F>)), all(args)); 
    };

    const aaa = applyAll(
      (a: number, b: string) => 'lol',
      [Ok<number, number>(42), Ok<string, string>('str')]
    );

    const asd =    [Ok(42), Ok('str')] as const;
    type P = { [P in keyof typeof asd]: ResultType<typeof asd[P]> }

    
}


export type Result<E, A> = I.Result<E, A> & IResult<E, A>;

interface IResult<E, A> {
  readonly result: I.Result<E, A>,
  // readonly tag: I.Result<E, A>['tag'],
  // readonly value: A | undefined,
  // readonly error: E | undefined,
  map: <B>(fab: (a: A) => B) => Result<E, B>,
  mapError: <F>(fef: (e: E) => F) => Result<F, A>,
  chain: <B>(fab: (a: A) => Result<E, B>) => Result<E, B>,
  apply: (v: Result<E, FunctionInputType<A>>) => Result<E, FunctionOutputType<A>>
  join: () => A extends Result<E, infer T> ? Result<E, T> : never,
  fold: <B>(f: I.Fold<E, A, B>) => B,
  or: (ra: Result<E, A>) => Result<E, A>,
  orElse: (ra: Result<E, A>) => Result<E, A>,
  default: (a: A) => Result<E, A>,
  toEither: () => Either<E, A>,
  toMaybe: () => Maybe<A>,
  get: () => A | undefined,
  getOrElse: (def: A) => A,
  getValue: () => Maybe<A>,
  getError: () => Maybe<E>,
  toString: () => string,
}

type ResultType<R> = R extends I.Result<any, infer T> ? T : never;

type ErrorType<R> = R extends I.Result<infer T, any> ? T : never;

type ResultTypeConstruct<A extends readonly I.Result<any, any>[] | Record<string | symbol | number, I.Result<any, any>>> =  { -readonly [P in keyof A]: ResultType<A[P]> };

const Constructor = <E, A>(data: I.Result<E, A>): Result<E, A> => ({
  [Brand]: Brand,
  result: data,
  ...data,
  // tag: result.tag,
  // value: I.getValue(result).get(),
  // error: I.getError(result).get(),
  map: (fab) => Constructor(I.map(fab, data)),
  chain: (fab) => Constructor(I.chain(fab, data)),
  apply: (v) => Constructor(I.apply(v, data)),
  mapError: <B>(fef: (e: E) => B) => Constructor(I.mapError<E, A, B>(fef, data)),
  // chain: (fab) => chain(fab, result),
  join: () => join(data),
  // apply: (v) => chain(apply(v), result),
  fold: (f) => I.fold(f, data),
  or: (other) => Constructor(I.or(data, other)),
  orElse: (other) => Constructor(I.orElse(data, other)),
  default: (def) => Constructor(I.defaultTo<E, A>(def, data)),
  toEither: () => I.toEither(data),
  toMaybe: () => I.getValue(data),
  get: () => I.getValue(data).get(),
  getOrElse: (def) => I.getOrElse(def, data),
  getValue: () => I.getValue(data),
  getError: () => I.getError(data),
  toString: () => I.toString(data)
});

export const Ok = <E = any, A = any>(value: A): Result<E, A> => Constructor(I.Ok(value));
export const Err = <E = any, A = any>(error: E): Result<E, A> => Constructor(I.Err(error));

export const join = 
<E, A>(r: I.Result<E, A>): A extends Result<E, infer T> ? Result<E, T> : never => {
  return Constructor(I.join(r)) as  A extends Result<E, infer T> ? Result<E, T> : never;
};

export const all = <T extends readonly I.Result<any, any>[] | []>(
  arr: T
): Result<ErrorType<T[keyof T]>, ResultTypeConstruct<T>> => Constructor(I.all(arr));

export const array = all;

export const some = <A extends NonEmptyArray<I.Result<any, any>>>(
  arr: A
): Result<ErrorType<A[number]>, ResultType<A[number]>> => Constructor(I.some(arr));

export const values = <A extends Array<I.Result<any, any>>>(
  arr: A
): Array<ResultType<A[number]>> => I.values(arr);

export const record = <R extends Record<string, I.Result<any, any>>>(
  record: R
): Result<ErrorType<R[keyof R]>, ResultTypeConstruct<R>> => Constructor(I.record(record));

export const applyAll = <
  A extends readonly I.Result<any, any>[] | [],
  P extends Array<any> & ResultTypeConstruct<A>,
  F extends (...args: P) => any
>(f: F,  args: A): Result<ErrorType<A[number]>, ReturnType<F>> => Constructor(I.applyAll<A, P, F>(f, args));

// const map = <E, A, B>(fab: (a: A) => B, r: I.Result<E, A>): Result<E, B> => Constructor(I.map<E, A, B>(fab)(r));
// const chain = <E, A, B>(fab: (a: A) => Result<E, B>, r: I.Result<E, A>): Result<E, B> => {
//   switch(r.tag) {
//   case 'ok':
//     return fab(r.value);
//   default:
//     return Constructor(r);
//   }
// };

// const join = 
//   <E, A>(r: I.Result<E, A>): A extends Result<E, infer T> ? Result<E, T> : never => {
//     return chain(
//       rr => isType<Result<E, any>>(Brand, rr) ? rr : Ok(rr), r
//     ) as A extends Result<E, infer T> ? Result<E, T> : never;
//   }


// export const applyAll = <A extends readonly Result<any, any>[] | [], P extends any[] & ResultTypeConstruct<A>, F extends (...args: P) => any>(f: F, args: A): Result<ErrorType<A[keyof A]>, ReturnType<F>> => {
//   return Result.all(args) .map((args) => f(...args as Parameters<F>)) as Result<ErrorType<A[keyof A]>, ReturnType<F>>;
// };

// export const all = <T extends readonly Result<any, any>[] | []>(arr: T): Result<ErrorType<T[keyof T]>, ResultTypeConstruct<T>> => {
//   return (arr as readonly Result<ErrorType<T[keyof T]>, any>[]).reduce(
//     (acc: Result<ErrorType<T[keyof T]>, ResultTypeConstruct<T>>, curr): Result<ErrorType<T[keyof T]>, ResultTypeConstruct<T>> => acc.chain(
//       a => curr.map((v) => [...(a as readonly unknown[]), v ]  as unknown as ResultTypeConstruct<T>)
//     ), Ok([]));
// };
    
// export const some = <A extends NonEmptyArray<Result<E, any>>, E = any>(arr: A): Result<E, ResultType<A[number]>> => {
//   return arr.reduce((acc, curr): Result<E, ResultType<A[number]>> => acc.or(curr));
// };
    
// export const values = <A extends Array<Result<any, any>>>(arr: A): Array<ResultType<A[number]>> => {
//   return arr.reduce((acc: Array<ResultType<A[number]>>, curr: A[number]): Array<ResultType<A[number]>> => 
//     curr.fold<Array<ResultType<A[number]>>>({
//       err: () => acc,
//       ok: v => [...acc, v]
//     })
//   , []);
// };
  
// export const array = all;

// export const record = <R extends Record<string, Result<any, any>>>(record: R): Result<ErrorType<R[keyof R]>, ResultTypeConstruct<R>> => {
//   return Object.entries(record).reduce((acc, [key, value]): Result<ErrorType<R[keyof R]>, Partial<ResultTypeConstruct<R>>> => {
//     return acc.chain((a) => value.map((v) => ({ ...a, [key]: v })));
//   }, Ok({})) as unknown as Result<ErrorType<R[keyof R]>, ResultTypeConstruct<R>>;
// };

export const Result = {
  Ok,
  Err,
  applyAll,
  all,
  some,
  array,
  record,
  values
} as const;
