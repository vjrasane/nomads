import { Result, Ok, Err } from '../../../result';

export type Task<A> = () => Promise<A>;

export const fork = <A>(t: Task<A>): Promise<A> => t();

export const map = <A, B>(fab: (a: A) => B) => (t: Task<A>): Task<B> => 
  () => t().then(fab);

export const encase = <A>(t: Task<A>): Task<Result<any, A>> => () => fork(t).then(Ok).catch(Err);