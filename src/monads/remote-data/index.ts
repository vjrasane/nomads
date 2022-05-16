import { Maybe } from '../maybe';
import * as I from './internal';

export class RemoteData<E, A> {
  constructor(private readonly internal: I.RemoteData<E, A>) {}

  static from = <E, A>(r: I.RemoteData<E, A>) => new RemoteData<E, A>(r);
  static Success = <A>(value: A) => RemoteData.from(I.Success(value));
  static Failure = <E>(error: E) => RemoteData.from(I.Failure(error));
  static StandBy: RemoteData<any, any> = RemoteData.from(I.StandBy);
  static Loading: RemoteData<any, any> = RemoteData.from(I.Loading);

  get tag(): I.RemoteData<E, A>['tag'] {
    return this.internal.tag;
  }

  get data(): A | undefined {
    return I.getData(this.internal).value;
  }

  get error(): E | undefined {
    return I.getError(this.internal).value;
  }

  get remoteData(): I.RemoteData<E, A> {
    return this.internal;
  }

  private apply = <C, B>(f: (ra: I.RemoteData<E, A>) => I.RemoteData<C, B>): RemoteData<C, B> =>
    RemoteData.from(f(this.internal));

  map = <B>(fab: (a: A) => B): RemoteData<E, B> => this.apply(I.map(fab));
  mapError = <B>(feb: (e: E) => B): RemoteData<B, A> => this.apply(I.mapError(feb));
  chain = <B>(fab: (a: A) => RemoteData<E, B>): RemoteData<E, B> => RemoteData.join(this.apply(I.map(fab)));
  default = (a: A): RemoteData<E, A> => this.apply(I.defaultTo(a));
  toMaybe = (): Maybe<A> => this.getData();
  get = (): A | undefined => this.data;
  getOrElse = (def: A) => I.getOrElse(def)(this.internal);
  getData = (): Maybe<A> => I.getData(this.internal);
  getError = (): Maybe<E> => I.getError(this.internal);
  toString = (): string => I.toString(this.internal);
  // orElse = (ra: RemoteData<E, A>) => this.apply(I.or(ra.internal));
  // default = (a: A): RemoteData<E, A> => this.apply(I.defaultTo(a));

  static join = <E, A>(r: RemoteData<E, RemoteData<E, A>>): RemoteData<E, A> => {
    switch (r.internal.tag) {
    case 'success':
      return r.internal.data;
    default:
      return new RemoteData(r.internal);
    }
  };
}

export const from = RemoteData.from;
export const join = RemoteData.join;
export const Success = RemoteData.Success;
export const Failure = RemoteData.Failure;
export const StandBy = RemoteData.StandBy;
export const Loading = RemoteData.Loading;
