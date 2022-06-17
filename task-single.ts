import { curry, FunctionInputType, FunctionOutputType } from './src/utils';

type TaskType<R> = R extends Task<infer T> ? T : never;

type TaskRecordTypes<T> = T extends Record<string | symbol | number, Task<any>> ? { -readonly [P in keyof T]: TaskType<T[P]> } : never;

type TaskArrayTypes<T extends readonly Task<any>[]> = { -readonly [P in keyof T]: TaskType<T[P]> };

interface ITask<A> {
  fork: () => Promise<A>,
  map: <B>(fab: (a: A) => B) => Task<B>,
  chain: <B>(fab: (a: A) => Task<B>) => Task<B>,
  join: () => A extends Task<infer T> ? Task<T> : never,
  apply: (t: Task<FunctionInputType<A>>) => Task<FunctionOutputType<A>>
}

namespace Instance {
export class Task<A> implements ITask<A> {
  readonly tag = 'task';

  constructor(private readonly executor: () => Promise<A>) {}

  static resolve = <A>(value: A): Task<A> => new Task(() => Promise.resolve(value));
  static sleep = (ms: number): Task<undefined> => new Task(
    () => new Promise(resolve => setTimeout(resolve, ms))
  );

  fork = () => this.executor();
  map = <B>(fab: (a: A) => B): Task<B> => new Task((): Promise<B> => this.fork().then(
    (a: A): B => fab(a))
  );
  chain = <B>(fab: (a: A) => Task<B>): Task<B> =>
    new Task(async (): Promise<B> =>
      this.fork().then(a => fab(a).fork())
    );
  join = (): A extends Task<infer T> ? Task<T> : never => {
    return this.chain(
      t => t instanceof Task
        ? t as unknown as A extends Task<infer T> ? Task<T> : never
        : Task.resolve(t) as unknown as A extends Task<infer T> ? Task<T> : never
    ) as A extends Task<infer T> ? Task<T> : never;
  };
  apply = (ra: Task<FunctionInputType<A>>): Task<FunctionOutputType<A>> =>
this.chain((f) => ra.map((a) => typeof f === 'function'
  ? curry(f as unknown as (...args: any[]) => any)(a)
  : a)) as Task<FunctionOutputType<A>>;
}}

export type Task<A> = Instance.Task<A>;

export const Task = <A>(executor: () => Promise<A>): Task<A> => new Instance.Task<A>(executor);

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

export const applyAll = <A extends readonly Task<any>[] | [], P extends any[] & TaskRecordTypes<A>, F extends (...args: P) => any>(f: F, args: A): Task<ReturnType<F>> => {
  return all(args).map((args) => f(...args as Parameters<F>)) as Task<ReturnType<F>>;
};

export const all =  <T extends readonly Task<any>[] | []>(arr: T): Task<TaskArrayTypes<T>> =>
  new Instance.Task(
    () =>  Promise.all(
      arr.map((t: Task<T[number]>) => t.fork())
    ) as unknown as Promise<TaskArrayTypes<T>>
  );

export const array = all;

export const record = <R extends Record<string | number | symbol, Task<any>>>(record: R): Task<TaskRecordTypes<R>> =>
  new Instance.Task(
    () => promiseRecord(
      mapValues((value) => value.fork(), record)
    ) as Promise<TaskRecordTypes<R>>
  );

Task.resolve = Instance.Task.resolve;
Task.sleep = Instance.Task.sleep;
Task.all = all;
Task.array = array;
Task.record = record;
Task.applyAll = applyAll;

export default Task;