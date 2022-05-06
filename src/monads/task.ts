export interface Task<A> {
	tag: 'task',
	fork: () => Promise<A>,
	map: <B>(fab: (a: A) => B) => Task<B>,
	chain: <B>(fab: (a: A) => Task<B>) => Task<B>,
}

const Task = <A>(fork: () => Promise<A>): Task<A> => ({
  tag: 'task',
  fork,
  map: (fab) => Task(async () => fab(await fork())),
  chain: (fab) => Task(async () => fab(await fork()).fork())
});

export const resolve = <A>(value: A): Task<A> => Task(() => Promise.resolve(value));

export const reject = <E>(err: E): Task<never> => Task(() => Promise.reject(err));
