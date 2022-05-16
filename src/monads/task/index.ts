import { Result } from '../result';
import * as I from './internal';

export class Task<A> {
  private constructor(private readonly internal: I.Task<A>) {}

  static of = <A>(f: () => Promise<A>): Task<A> => Task.from(I.Task(f));
  static from = <A>(t: I.Task<A>): Task<A> => new Task(t);

  get tag(): I.Task<A>['tag'] {
    return this.internal.tag;
  }

  get task(): I.Task<A> {
    return this.internal;
  }

  private apply = <B>(f: (ra: I.Task<A>) => I.Task<B>): Task<B> => new Task(f(this.internal));

  fork = (): Promise<A> => I.fork(this.internal);

  map = <B>(fab: (a: A) => B): Task<B> => this.apply(I.map(fab));

  chain = <B>(fab: (a: A) => Task<B>): Task<B> => Task.join(Task.of(() => this.fork().then(fab)));

  encase = (): Task<Result<any, A>> => Task.from(I.encase(this.internal));

  static reject = <E>(err: E): Task<never> => Task.of(() => Promise.reject(err));
  static resolve = <A>(value: A): Task<A> => Task.of(() => Promise.resolve(value));
  static join = <A>(t: Task<Task<A>>): Task<A> => Task.of(() => t.fork().then((t) => t.fork()));
}

export const join = Task.join;
export const from = Task.from;
export const of = Task.of;
export const resolve = Task.resolve;
export const reject = Task.reject;