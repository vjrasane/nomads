import { Result, Err, Ok } from "../result";
import * as Class from "./task.class";
import { ErrorType, TaskConstructType } from "./task.class";

export type Task<E, A> = Class.Task<E, A>;

export const Task = <A, E = any>(executor: () => Promise<A>): Task<E, A> => new Class.Task<E, A>(
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
	new Class.Task(
		() =>  Promise.all(arr.map((t: Task<any, any>) => t.fork()))
		.then(Result.all) as Promise<Result<ErrorType<T[keyof T]>, TaskConstructType<T>>>
);

export const array = all;

export const record = <R extends Record<string | number | symbol, Task<any, any>>>(record: R): Task<ErrorType<R[keyof R]>, TaskConstructType<R>> => 
	new Class.Task(
	() => promiseRecord(
		mapValues((value) => value.fork(), record)
	).then(Result.record) as Promise<Result<ErrorType<R[keyof R]>, TaskConstructType<R>>>
	);
  
Task.resolve = Class.Task.resolve;
Task.reject = Class.Task.reject;
Task.sleep = Class.Task.sleep;
Task.all = all;
Task.array = array;
Task.record = record;
Task.applyAll = applyAll;
