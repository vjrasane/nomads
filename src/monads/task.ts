// import { Err, Ok, Result } from "./result";

// export interface Task<E, A> {
// 	tag: 'task',
// 	fork: () => Promise<Result<E, A>>,
// 	map: <B>(fab: (a: A) => B) => Task<E, B>,
// 	mapError: <B>(feb: (e: E) => B) => Task<B, A>,
// 	chain: <B>(fab: (a: A) => Task<E, B>) => Task<E, B>
// }

// export const Task = <A>(fork: () => Promise<A>): Task<any, A> => ({
//   tag: 'task',
//   fork: () => fork().then(Ok).catch(Err),
//   map: (fab) => Task(async () => fab(await fork())),
//   mapError: (feb) => Task(async () => {
// 		const result = await Task(fork).fork();
// 		return result
// 			.mapError(feb)
// 			.fold(Promise.reject, (b) => Promise.resolve(b))
// 	}),
//   chain: (fab) => Task(async () => {
// 		const a = await fork();
// 		const result = await fab(a).fork();
// 		return result
// 			.fold(Promise.reject, (b) => Promise.resolve(b))
//   	})
// });

// export const resolve = <A>(value: A): Task<any, A> => Task(() => Promise.resolve(value));

// export const reject = <E>(err: E): Task<E, any> => Task(() => Promise.reject(err));

// const res: Result<string, string> = Ok("asd");
