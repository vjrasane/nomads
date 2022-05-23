import { Result, Ok, Err } from './result';

namespace I {
  export type Task<E, A> = () => Promise<Result<E, A>>;

  export const Task = <A>(f: () => Promise<A>): Task<any, A> => () => f().then(Ok).catch(Err);

  export const map = <A, B, E>(fab: (a: A) => B) => (t: Task<E, A>): Task<E, B> => () => t().then(r => r.map(fab));

  export const mapError = <A, E, F>(feb: (e: E) => F) => (t: Task<E, A>): Task<F, A> => () => t().then(r => r.mapError(feb));
}

type TaskType<T> = T extends Task<any, infer A> ? A : never;

const mapValues = <K extends symbol | string | number, R extends Record<K, unknown>, B>(
  mapper: (value: R[keyof R]) => B, 
  record: R): { [P in keyof R]: B } => Object.entries(record).reduce(
    (acc, [key, value]): Partial<{ [P in keyof R]: B }> => ({
      ...acc, [key]: mapper(value as R[keyof R])
    }), {})  as { [P in keyof R]: B };


const promiseRecord = <R extends Record<string, Promise<any>>>(record: R): Promise<{ [P in keyof R]: Awaited<R[P]> }> => 
  Promise.all(Object.entries(record)
    .map(async ([key, value]) => [key, await value]))
    .then(entries => entries.reduce(
      (acc, [key, value]): Partial<{ [P in keyof R]: Awaited<R[P]> }> => ({
        ...acc, [key]: value
      }), {}
    ) as { [P in keyof R]: Awaited<R[P]> });


export class Task<E, A> {
  private constructor(private readonly internal: I.Task<E, A>) {}

  static of = <A>(f: () => Promise<A>): Task<any, A> => Task.from(I.Task(f));
  static from = <E, A>(t: I.Task<E, A>): Task<E, A> => new Task(t);

  readonly tag = 'task';

  get task(): I.Task<E, A> {
    return this.internal;
  }

  private apply = <F, B>(f: (ra: I.Task<E, A>) => I.Task<F, B>): Task<F, B> => new Task(f(this.internal));

  fork = (): Promise<Result<E, A>> => this.internal();
  map = <B>(fab: (a: A) => B): Task<E, B> => this.apply(I.map(fab));
  mapError = <F>(feb: (e: E) => F): Task<F, A> => this.apply(I.mapError(feb));
  chain = <B>(fab: (a: A) => Task<E, B>): Task<E, B> => Task.from(
    async (): Promise<Result<E, B>> => {
      const { result } = await this.fork();
      switch(result.tag) {
      case 'ok':
        return fab(result.value).fork();
      case 'err':
        return Result.from(result);
      }
    });

  static reject = <E, A = any>(err: E): Task<E, A> => Task.from(() => Promise.resolve(Result.Err(err)));
  static resolve = <A, E = any>(value: A): Task<E, A> => Task.of(() => Promise.resolve(value));
  static join = <E, A>(t: Task<E, Task<E, A>>): Task<E, A> => t.chain(t => t);

  static all =  <T extends readonly Task<E, any>[] | [], E = any>(arr: T): Task<E, { -readonly [P in keyof T]: TaskType<T[P]> }> => 
    Task.from(
      () =>  Promise.all(arr.map(t => t.fork()))
        .then(Result.all) as unknown as Promise<Result<E, { -readonly [P in keyof T]: TaskType<T[P]> }>>
    );

  static array = Task.all;

  static record = <R extends Record<string, Task<E, any>>, E = any>(record: R): Task<E, { -readonly [P in keyof R]: TaskType<R[P]> }> => 
    Task.from(
      () => promiseRecord(
        mapValues((value) => value.fork(), record)
      ).then(Result.record) as Promise<Result<E, { [P in keyof R]: TaskType<R[P]> }>>
    );
}

export const record = Task.record;
export const array = Task.array;
export const all = Task.all;
export const join = Task.join;
export const from = Task.from;
export const of = Task.of;
export const resolve = Task.resolve;
export const reject = Task.reject;
