import { Result } from "../../../result";
import * as I from "./task.internal"

export class Task<A> {
	private constructor(private readonly internal: I.Task<A>) {}

	private apply = <B>(
		f: (ra: I.Task<A>) => I.Task<B>
	): Task<B> => new Task(f(this.internal))

	fork = (): Promise<A> => I.fork(this.internal)

	map = <B>(fab: (a: A) => B): Task<B> => this.apply(I.map(fab))

	chain = <B>(fab: (a: A) => Task<B>): Task<B> => new Task(() => this.fork().then(fab).then(t => t.fork()))

	encase = (): Task<Result<any, A>> => new Task(I.encase(this.internal))

	unwrap = (): I.Task<A> => this.internal

	static from = <A>(t: I.Task<A>): Task<A> => new Task(t);

	static reject = <E>(err: E): Task<never> => new Task(() => Promise.reject(err))
	static resolve = <A>(value: A): Task<A> => new Task(() => Promise.resolve(value))
}

export const resolve = Task.resolve;
export const reject = Task.reject;