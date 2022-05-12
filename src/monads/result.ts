// import { string } from 'fp-ts';
// import { Either, Left, Right } from './either';
// import *  as M from './maybe';
// import { Just, Maybe, Nothing } from './maybe';

// type Ok<A> = {
//   readonly tag: 'ok',
//   readonly value: A
// }

// type Err<E> = {
//   readonly tag: 'err',
//   readonly error: E
// }

// export interface Result<E, A>  {
//   readonly result: Ok<A> | Err<E>,
//   readonly map: <B>(fab: (a: A) => B) => Result<E, B>,
// 	readonly mapError: <B>(feb: (e: E) => B) => Result<B, A>,
// 	readonly chain: <B>(fab: (a: A) => Result<E, B>) => Result<E, B>
// 	readonly fold: <C>(fec: (e: E) => C, fac: (a: A) => C) => C,
//   readonly or: (a: Result<E, A>) => Result<E, A>,
//   readonly default: (a: A) => Result<E, A>,
// 	readonly toEither: () => Either<E, A>,
// 	readonly toMaybe: () => Maybe<A>,
// 	readonly get: () => A | undefined,
// 	readonly getOrElse: (def: A) => A,
// 	readonly getValue: () => Maybe<A>,
// 	readonly getError: () => Maybe<E>,
// 	readonly toString: () => string,
// }



// // export type Result<E, A> = Ok<A> | Err<E>

// // type Result<E, A> = {
// //   readonly tag: 'ok',
// // 	readonly value: A
// // } & BaseResult<E, A> | {
// //   readonly tag: 'err',
// // 	readonly error: E
// // } & BaseResult<E, A>

// // export interface Ok<T> extends Result<any, T> {
// // 	readonly tag: 'ok',
// // 	readonly value: T
// // }

// // export interface Err<E> extends Result<E, any> {
// // 	readonly tag: 'err',
// // 	readonly error: E
// // }

// // // export type Result<E, A> = Ok<A> | Err<E>;

// const Result = <E, A>(result: typeof Result["result"]): Omit<Result<E, A>, "result"> => ({
//   map: <E, B>(fab: (a: A) => B): Result<E, B> => Ok(fab(value)),
//   mapError: <E, B>(feb: (e: E) => B): Result<B, A> => Ok(value),
//   chain: (fab) => fab(value),
//   fold: (fec, fac) => fac(value), 
//   or: () => Ok(value),
//   default: () => Ok(value),
//   toEither: () => Right(value),
//   toMaybe: () => Ok(value).getValue(),
//   get: () => value,
//   getOrElse: () => value,
//   getValue: () => Just(value),
//   getError: () => Nothing,
//   toString: () => `Ok(${value})`
// })

// export const Ok = <A>(value: A): Result<any, A> => ({
//   // tag: 'ok',
//   // value,
//   result: { tag: "ok", value },
//   ...Result({ tag: "ok", value })
//   // map: <E, B>(fab: (a: A) => B): Result<E, B> => Ok(fab(value)),
//   // mapError: <E, B>(feb: (e: E) => B): Result<B, A> => Ok(value),
//   // chain: (fab) => fab(value),
//   // fold: (fec, fac) => fac(value), 
//   // or: () => Ok(value),
//   // default: () => Ok(value),
//   // toEither: () => Right(value),
//   // toMaybe: () => Ok(value).getValue(),
//   // get: () => value,
//   // getOrElse: () => value,
//   // getValue: () => Just(value),
//   // getError: () => Nothing,
//   // toString: () => `Ok(${value})`
// });

// export const Err = <E>(error: E): Result<E, any> => ({
//   // tag: 'err',
//   // error,
//   result: { tag: "err", error },
//   ...Result({ tag: "err", error })
//   // map: <A, B>(fab: (a: A) => B): Result<E, B> => Err(error),
//   // mapError: <B, A>(feb: (e: E) => B): Result<B, A> => Err(feb(error)),
//   // chain: () => Err(error),
//   // fold: <B>(fec: (e: E) => B): B => fec(error),
//   // or: (a) => a.get() !== undefined ? a : Err(error),
//   // default: (a) => Ok(a),
//   // toEither: () => Left(error),
//   // toMaybe: () => Err(error).getValue(),
//   // get: () => undefined,
//   // getOrElse: (def) => def,
//   // getValue: () => Nothing,
//   // getError: () => Just(error),
//   // toString: () => `Err(${error})`
// });

// export const applyTo = <A, B, E>(a: Result<E, A>) => (f: (a: A) => B): Result<E, B> => a.map(f);  

// export const join = <A, E>(a: Result<E, Result<E, A>>): Result<E, A> => {
//   return a.chain((r: Result<E, A>) => r)
// };

// const res: Result<number, string> = Ok("str")

// const val = res.map(() => "err");