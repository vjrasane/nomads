import { Result } from '../result';
import * as I from './internal';

type TypeOfMaybe<M> = M extends Maybe<infer T> ? T : never;

export class Maybe<A> {
  private constructor(private readonly internal: I.Maybe<A>) {}

  static from = <A>(m: I.Maybe<A>) => new Maybe(m);
  static Just = <A>(value: A): Maybe<A> => Maybe.from(I.Just(value));
  static Nothing: Maybe<any> = new Maybe<any>(I.Nothing);

  get tag(): I.Maybe<A>['tag'] {
    return this.internal.tag;
  }

  get value(): A | undefined {
    return I.toOptional(this.internal);
  }

  get maybe(): I.Maybe<A> {
    return this.internal;
  }

  private apply = <B>(f: (ra: I.Maybe<A>) => I.Maybe<B>): Maybe<B> => new Maybe(f(this.internal));

  map = <B>(fab: (a: A) => B): Maybe<B> => this.apply(I.map(fab));
  chain = <B>(fab: (a: A) => Maybe<B>): Maybe<B> => Maybe.join(this.apply(I.map(fab)));
  filter = (f: (a: A) => boolean): Maybe<A> => this.apply(I.filter(f));
  fold = <B>(fb: () => B, fab: (a: A) => B): B => I.fold(fb, fab)(this.internal);
  or = (m: Maybe<A>) => this.apply(I.orElse(m.internal));
  orElse = (m: Maybe<A>) => this.apply(I.or(m.internal));
  default = (a: A) => this.apply(I.defaultTo(a));
  toResult = <E>(err: E): Result<E, A> => I.toResult<E, A>(err)(this.internal);
  get = (): A | undefined => this.value;
  getOrElse = (def: A) => I.getOrElse(def)(this.internal);
  toString = (): string => I.toString(this.internal);

  static join = <A>(m: Maybe<Maybe<A>>): Maybe<A> => {
    switch (m.internal.tag) {
    case 'just':
      return m.internal.value;
    default:
      return new Maybe(m.internal);
    }
  };

  static applyTo =
    <A, B>(m: Maybe<A>) =>
    (f: (a: A) => B): Maybe<B> =>
      m.map(f);
  static fromOptional = <A>(a: A | undefined): Maybe<A> => Maybe.from(I.fromOptional(a));
  static fromNullable = <A>(a: A | null | undefined): Maybe<A> => Maybe.from(I.fromNullable(a));
  static fromNumber = (a: number): Maybe<number> => Maybe.from(I.fromNumber(a));
  static nth = <A>(index: number, arr: Array<A>): Maybe<A> => Maybe.from(I.nth(index, arr));
  static first = <A>(arr: Array<A>): Maybe<A> => Maybe.from(I.first(arr));
  static last = <A>(arr: Array<A>): Maybe<A> => Maybe.from(I.last(arr));

  static record = <R extends Record<string, Maybe<any>>>(record: R): Maybe<{ [P in keyof R]: TypeOfMaybe<R[P]> }> => {
    return Object.entries(record).reduce((acc, [key, value]): Maybe<Partial<{ [P in keyof R]: TypeOfMaybe<R[P]> }>> => {
      return acc.chain((a) => value.map((v) => ({ ...a, [key]: v })));
    }, Just({})) as unknown as Maybe<{ [P in keyof R]: TypeOfMaybe<R[P]> }>;
  };
}

export const Just = Maybe.Just;
export const Nothing = Maybe.Nothing;
export const from = Maybe.from;
export const applyTo = Maybe.applyTo;
export const fromOptional = Maybe.fromOptional;
export const fromNullable = Maybe.fromNullable;
export const fromNumber = Maybe.fromNumber;
export const nth = Maybe.nth;
export const first = Maybe.first;
export const last = Maybe.last;
export const join = Maybe.join;
export const record = Maybe.record;