import { Result, Ok, Err } from './result';

namespace I {
  export type Task<E, A> = () => Promise<Result<E, A>>;

  export const Task = <A>(f: () => Promise<A>): Task<any, A> => () => f().then(Ok).catch(Err);

  export const map = <E, A, B>(fab: (a: A) => B) => (t: Task<E, A>): Task<E, B> => () => t().then(r => r.map(fab));

  export const mapError = <E, A, F>(feb: (e: E) => F) => (t: Task<E, A>): Task<F, A> => () => t().then(r => r.mapError(feb));
}

export interface Task<E, A> {
  readonly tag: 'task',
  readonly task: I.Task<E, A>,
  fork: () => Promise<Result<E, A>>,
  map: <B>(fab: (a: A) => B) => Task<E, B>,
  mapError: <F>(fef: (e: E) => F) => Task<F, A>,
  chain: <B>(fab: (a: A) => Task<E, B>) => Task<E, B>,
}

type TaskType<T> = T extends Task<any, infer A> ? A : never;

type ErrorType<T> = T extends Task<infer E, any> ? E : never; 

type TaskTypeConstruct<A extends readonly Task<any, any>[] | Record<string | symbol | number, Task<any, any>>> =  { -readonly [P in keyof A]: TaskType<A[P]> };

const TaskConstructor = <E, A>(task: I.Task<E, A>): Task<E, A> => ({
  task,
  tag: 'task',
  fork: () => task(),
  map: (fab) => map(fab, task),
  mapError: <F>(fef: (e: E) => F) => TaskConstructor(I.mapError<E, A, F>(fef)(task)),
  chain: (fab) => chain(fab, task)
});

const map = <E, A, B>(fab: (a: A) => B, t: I.Task<E, A>): Task<E, B> => TaskConstructor(I.map<E, A, B>(fab)(t));
const chain = <E, A, B>(fab: (a: A) => Task<E, B>, t: I.Task<E, A>): Task<E, B> => TaskConstructor(
  async (): Promise<Result<E, B>> => {
    const { result } = await t();
    switch(result.tag) {
    case 'ok':
      return fab(result.value).fork();
    case 'err':
      return Err(result.error);
    }
  });

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
  
export const reject = <E, A = any>(err: E): Task<E, A> => TaskConstructor(() => Promise.resolve(Result.Err(err)));
export const resolve = <A, E = any>(value: A): Task<E, A> => TaskConstructor(() => Promise.resolve(Result.Ok(value)));
export const join = <E, A>(t: Task<E, Task<E, A>>): Task<E, A> => t.chain(t => t);

export const apply = <A extends readonly Task<any, any>[] | [], P extends any[] & TaskTypeConstruct<A>, F extends (...args: P) => any>(f: F, args: A): Task<ErrorType<A[keyof A]>, ReturnType<F>> => {
  return Task.all(args) .map((args) => f(...args as Parameters<F>)) as Task<ErrorType<A[keyof A]>, ReturnType<F>>;
};

export const applyTo = <E, A, B>(r: Task<E, A>) => (f: (a: A) => B): Task<E, B> => r.map(f);

export const all =  <T extends readonly Task<any, any>[] | []>(arr: T): Task<ErrorType<T[keyof T]>, TaskTypeConstruct<T>> => 
  TaskConstructor(
    () =>  Promise.all(arr.map((t: Task<any, any>) => t.fork()))
      .then(Result.all) as Promise<Result<ErrorType<T[keyof T]>, TaskTypeConstruct<T>>>
  );

export const array = all;

export const record = <R extends Record<string | number | symbol, Task<any, any>>>(record: R): Task<ErrorType<R[keyof R]>, TaskTypeConstruct<R>> => 
  TaskConstructor(
    () => promiseRecord(
      mapValues((value) => value.fork(), record)
    ).then(Result.record) as Promise<Result<ErrorType<R[keyof R]>, TaskTypeConstruct<R>>>
  );

export const Task = <A>(f: () => Promise<A>): Task<any, A> => TaskConstructor(I.Task(f));

Task.reject = reject;
Task.resolve = resolve;
Task.join = join;
Task.all = all;
Task.array = array;
Task.record = record;
Task.apply = apply;
Task.applyTo = applyTo;
