import { Result, Ok, Err } from './result';

namespace I {
  export type Task<E, A> = () => Promise<Result<E, A>>;

  export const Task = <A>(f: () => Promise<A>): Task<any, A> => () => f().then(Ok).catch(Err);

  export const map = <A, B, E>(fab: (a: A) => B) => (t: Task<E, A>): Task<E, B> => () => t().then(r => r.map(fab));

  export const mapError = <A, E, F>(feb: (e: E) => F) => (t: Task<E, A>): Task<F, A> => () => t().then(r => r.mapError(feb));
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

const TaskConstructor = <E, A>(task: I.Task<E, A>): Task<E, A> => ({
  task,
  tag: 'task',
  fork: () => task(),
  map: (fab) => map(fab, task),
  mapError: (fef) => apply(I.mapError(fef), task),
  chain: (fab) => chain(fab, task)
});

const apply = <A, B, E, F>(f: (t: I.Task<E, A>) => I.Task<F, B>, t: I.Task<E, A>): Task<F, B> => TaskConstructor(f(t));
const map = <E, A, B>(fab: (a: A) => B, t: I.Task<E, A>): Task<E, B> => apply(I.map(fab), t);
const chain = <E, A, B>(fab: (a: A) => Task<E, B>, t: I.Task<E, A>): Task<E, B> => TaskConstructor(
  async (): Promise<Result<E, B>> => {
    const { result } = await t();
    switch(result.tag) {
    case 'ok':
      return fab(result.value).fork();
    case 'err':
      return Result.from(result);
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
  
export const of = <A>(f: () => Promise<A>): Task<any, A> => TaskConstructor(I.Task(f));
export const reject = <E, A = any>(err: E): Task<E, A> => TaskConstructor(() => Promise.resolve(Result.Err(err)));
export const resolve = <A, E = any>(value: A): Task<E, A> => of(() => Promise.resolve(value));
export const join = <E, A>(t: Task<E, Task<E, A>>): Task<E, A> => t.chain(t => t);

export const all =  <T extends readonly Task<E, any>[] | [], E = any>(arr: T): Task<E, { -readonly [P in keyof T]: TaskType<T[P]> }> => 
  TaskConstructor(
    () =>  Promise.all(arr.map(t => t.fork()))
      .then(Result.all) as unknown as Promise<Result<E, { -readonly [P in keyof T]: TaskType<T[P]> }>>
  );

export const array = all;

export const record = <R extends Record<string, Task<E, any>>, E = any>(record: R): Task<E, { -readonly [P in keyof R]: TaskType<R[P]> }> => 
  TaskConstructor(
    () => promiseRecord(
      mapValues((value) => value.fork(), record)
    ).then(Result.record) as Promise<Result<E, { [P in keyof R]: TaskType<R[P]> }>>
  );

export const Task = ({
  of,
  reject,
  resolve,
  join,
  all,
  array,
  record
}) as const; 
