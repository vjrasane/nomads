import { curry, FunctionInputType, FunctionOutputType } from './utils';
import { Err, Result } from './result.api';

export type TaskType<T> = T extends Task<any, infer A> ? A : never;

export type ErrorType<T> = T extends Task<infer E, any> ? E : never;

export type TaskConstructType<A extends readonly Task<any, any>[] | Record<string | symbol | number, Task<any, any>>> =  { -readonly [P in keyof A]: TaskType<A[P]> };

interface ITask<E, A> {
fork: () => Promise<Result<E, A>>,
map: <B>(fab: (a: A) => B) => Task<E, B>,
mapError: <F>(fef: (e: E) => F) => Task<F, A>,
chain: <B>(fab: (a: A) => Task<E, B>) => Task<E, B>,
join: () => A extends Task<E, infer T> ? Task<E, T> : never,
apply: (t: Task<E, FunctionInputType<A>>) => Task<E, FunctionOutputType<A>>
}

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
}