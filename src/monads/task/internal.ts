import { Result, Ok, Err } from '../../../result';

export type Task<E, A> = () => Promise<Result<E, A>>;

export const Task = <A>(f: () => Promise<A>): Task<any, A> => () => f().then(Ok).catch(Err);

export const map = <A, B, E>(fab: (a: A) => B) => (t: Task<E, A>): Task<E, B> => () => t().then(r => r.map(fab));

export const mapError = <A, E, F>(feb: (e: E) => F) => (t: Task<E, A>): Task<F, A> => () => t().then(r => r.mapError(feb));
