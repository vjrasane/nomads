import { Result, Ok, Err } from '../../../result';

export type Task<A> = {
  readonly tag: 'task';
  readonly fork: () => Promise<A>;
};

export const Task = <A>(fork: () => Promise<A>): Task<A> => ({
  tag: 'task',
  fork,
});

export const fork = <A>(t: Task<A>): Promise<A> => t.fork();

export const map =
  <A, B>(fab: (a: A) => B) =>
    (t: Task<A>): Task<B> =>
      Task(() => fork(t).then(fab));

export const encase = <A>(t: Task<A>): Task<Result<any, A>> =>
  Task(() => fork(t).then(Ok).catch(Err));
