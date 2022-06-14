import Result, { Err, Ok } from './result';
import { curry, FunctionInputType, FunctionOutputType } from './src/utils';

type TaskType<T> = T extends Task<any, infer A> ? A : never;

type ErrorType<T> = T extends Task<infer E, any> ? E : never;

type TaskConstructType<A extends readonly Task<any, any>[] | Record<string | symbol | number, Task<any, any>>> =  { -readonly [P in keyof A]: TaskType<A[P]> };

interface ITask<E, A> {
  fork: () => Promise<Result<E, A>>,
  map: <B>(fab: (a: A) => B) => Task<E, B>,
  mapError: <F>(fef: (e: E) => F) => Task<F, A>,
  chain: <B>(fab: (a: A) => Task<E, B>) => Task<E, B>,
  join: () => A extends Task<E, infer T> ? Task<E, T> : never,
  apply: (t: Task<E, FunctionInputType<A>>) => Task<E, FunctionOutputType<A>>
}
namespace Instance {
export class Task<E, A> implements ITask<E, A> {
  readonly tag = 'task';

  constructor(private readonly executor: () => Promise<Result<E, A>>) {}

  static reject = <E, A = any>(err: E): Task<E, A> => new Task(() => Promise.resolve(Result.Err(err)));
  static resolve = <A, E = any>(value: A): Task<E, A> => new Task(() => Promise.resolve(Result.Ok(value)));
  static sleep = (ms: number): Task<any, undefined> => new Task(
    () => new Promise(resolve => setTimeout(
      () => resolve(Result.Ok(undefined)), ms))
  );

  fork = () => this.executor();
  map = <B>(fab: (a: A) => B): Task<E, B> => new Task((): Promise<Result<E, B>> => this.fork().then(
    (r: Result<E, A>): Result<E, B> => r.map(fab))
  );
  mapError = <F>(fef: (e: E) => F): Task<F, A> => new Task((): Promise<Result<F, A>> => this.fork().then(
    (r: Result<E, A>): Result<F, A> => r.mapError(fef))
  );
  chain = <B>(fab: (a: A) => Task<E, B>): Task<E, B> =>
    new Task(async (): Promise<Result<E, B>> =>
      this.fork().then(r => r.fold<Result<E, B> | Promise<Result<E, B>>>({
        ok: (v) => fab(v).fork(),
        err: (e) => Err(e)
      })));
  join = (): A extends Task<E, infer T> ? Task<E, T> : never => {
    return this.chain(
      t => t instanceof Task
        ? t as unknown as A extends Task<E, infer T> ? Task<E, T> : never
        : Task.resolve(t) as unknown as A extends Task<E, infer T> ? Task<E, T> : never
    ) as A extends Task<E, infer T> ? Task<E, T> : never;
  };
  apply = (ra: Task<E, FunctionInputType<A>>): Task<E, FunctionOutputType<A>> =>
this.chain((f) => ra.map((a) => typeof f === 'function'
  ? curry(f as unknown as (...args: any[]) => any)(a)
  : a)) as Task<E, FunctionOutputType<A>>;
}}

export type Task<E, A> = Instance.Task<E, A>;

export const Task = <A, E = any>(executor: () => Promise<A>): Task<E, A> => new Instance.Task<E, A>(
  () => executor().then(Ok).catch(Err)
);

const mapValues = <K extends symbol | string | number, R extends Record<K, unknown>, B>(
  mapper: (value: R[keyof R]) => B,
  record: R): { [P in keyof R]: B } => Object.entries(record).reduce(
    (acc, [key, value]): Partial<{ [P in keyof R]: B }> => ({
      ...acc, [key]: mapper(value as R[keyof R])
    }), {})  as { [P in keyof R]: B };


const promiseRecord = <R extends Record<string | number | symbol, Promise<any>>>(record: R): Promise<{ [P in keyof R]: Awaited<R[P]> }> =>
  Promise.all(Object.entries(record)
    .map(async ([key, value]) => [key, await value]))
    .then(entries => entries.reduce(
      (acc, [key, value]): Partial<{ [P in keyof R]: Awaited<R[P]> }> => ({
        ...acc, [key]: value
      }), {}
    ) as { [P in keyof R]: Awaited<R[P]> });

export const applyAll = <A extends readonly Task<any, any>[] | [], P extends any[] & TaskConstructType<A>, F extends (...args: P) => any>(f: F, args: A): Task<ErrorType<A[keyof A]>, ReturnType<F>> => {
  return all(args).map((args) => f(...args as Parameters<F>)) as Task<ErrorType<A[keyof A]>, ReturnType<F>>;
};

export const all =  <T extends readonly Task<any, any>[] | []>(arr: T): Task<ErrorType<T[keyof T]>, TaskConstructType<T>> =>
  new Instance.Task(
    () =>  Promise.all(arr.map((t: Task<any, any>) => t.fork()))
      .then(Result.all) as Promise<Result<ErrorType<T[keyof T]>, TaskConstructType<T>>>
  );

export const array = all;

export const record = <R extends Record<string | number | symbol, Task<any, any>>>(record: R): Task<ErrorType<R[keyof R]>, TaskConstructType<R>> =>
  new Instance.Task(
    () => promiseRecord(
      mapValues((value) => value.fork(), record)
    ).then(Result.record) as Promise<Result<ErrorType<R[keyof R]>, TaskConstructType<R>>>
  );

Task.resolve = Instance.Task.resolve;
Task.reject = Instance.Task.reject;
Task.sleep = Instance.Task.sleep;
Task.all = all;
Task.array = array;
Task.record = record;
Task.applyAll = applyAll;

export default Task;