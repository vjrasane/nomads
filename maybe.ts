import { Err, Ok, Result } from './result';

namespace I {

type Just<A> = {
  readonly tag: 'just';
  readonly value: A;
};

type Nothing = {
  readonly tag: 'nothing';
};

export type Maybe<A> = Just<A> | Nothing;

export const Just = <A>(value: A): Maybe<A> => ({ tag: 'just', value });
export const Nothing: Maybe<any> = { tag: 'nothing' };

export const toOptional = <A>(m: Maybe<A>): A | undefined => {
  switch (m.tag) {
  case 'just':
    return m.value;
  default:
    return undefined;
  }
};

export const map =
  <A, B>(fab: (a: A) => B) =>
    (m: Maybe<A>): Maybe<B> => {
      switch (m.tag) {
      case 'just':
        return Just(fab(m.value));
      default:
        return m;
      }
    };

export const filter =
  <A>(f: (a: A) => boolean) =>
    (m: Maybe<A>): Maybe<A> => {
      switch (m.tag) {
      case 'just':
        return f(m.value) ? m : Nothing;
      default:
        return m;
      }
    };

export type Fold<A, B> = {
  just: (a: A) => B,
  nothing: () => B
}

export const fold =
  <A, B>(f: Fold<A, B>) =>
    (m: Maybe<A>): B => {
      switch (m.tag) {
      case 'just':
        return f.just(m.value);
      default:
        return f.nothing();
      }
    };

export const or =
  <A>(first: Maybe<A>) =>
    (second: Maybe<A>): Maybe<A> => {
      switch (first.tag) {
      case 'just':
        return first;
      default:
        return second;
      }
    };

export const orElse =
  <A>(first: Maybe<A>) =>
    (second: Maybe<A>): Maybe<A> => {
      switch (second.tag) {
      case 'just':
        return second;
      default:
        return first;
      }
    };

export const defaultTo =
  <A>(def: A) =>
    (m: Maybe<A>): Maybe<A> => {
      switch (m.tag) {
      case 'just':
        return m;
      default:
        return Just(def);
      }
    };

export const getOrElse =
  <A>(def: A) =>
    (m: Maybe<A>): A => {
      switch (m.tag) {
      case 'just':
        return m.value;
      default:
        return def;
      }
    };

export const toResult =
  <E, A>(err: E) =>
    (m: Maybe<A>): Result<E, A> => {
      switch (m.tag) {
      case 'just':
        return Ok(m.value);
      default:
        return Err(err);
      }
    };

export const toString = <A>(m: Maybe<A>): string => {
  switch (m.tag) {
  case 'just':
    return `Just(${m.value})`;
  default:
    return 'Nothing';
  }
};

export const fromOptional = <A>(a: A | undefined): Maybe<A> => {
  switch (a) {
  case undefined:
    return Nothing;
  default:
    return Just(a);
  }
};

export const fromNullable = <A>(a: A | null | undefined): Maybe<A> => {
  switch (a) {
  case undefined:
  case null:
    return Nothing;
  default:
    return Just(a);
  }
};

export const fromNumber = (a: number): Maybe<number> => {
  if (isNaN(a)) return Nothing;
  return Just(a);
};

export const nth = <A>(index: number, arr: Array<A>): Maybe<A> => fromOptional(arr[index]);

export const first = <A>(arr: Array<A>): Maybe<A> => nth(0, arr);

export const last = <A>(arr: Array<A>): Maybe<A> => nth(arr.length - 1, arr);

export const find = <A, T extends readonly A[]>(f: (a: A) => boolean) => (arr: T): Maybe<A> => fromOptional(arr.find(f));
}

type MaybeType<M> = M extends Maybe<infer T> ? T : never;
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
  fold = <B>(f: I.Fold<A, B>): B => I.fold(f)(this.internal);
  or = (m: Maybe<A>) => this.apply(I.orElse(m.internal));
  orElse = (m: Maybe<A>) => this.apply(I.or(m.internal));
  default = (a: A) => this.apply(I.defaultTo(a));
  toResult = <E>(err: E): Result<E, A> => I.toResult<E, A>(err)(this.internal);
  get = (): A | undefined => this.value;
  getOrElse = (def: A) => I.getOrElse(def)(this.internal);
  toString = (): string => I.toString(this.internal);

  concatTo = <T>(arr: Array<T | A>): Array<T | A> => this.map((a): Array<T | A> => [a, ...arr]).getOrElse(arr);
  appendTo = <T>(arr: Array<T | A>): Array<T | A> => this.map((a): Array<T | A> => [...arr, a]).getOrElse(arr);

  static join = <A>(m: Maybe<Maybe<A>>): Maybe<A> => {
    switch (m.internal.tag) {
    case 'just':
      return m.internal.value;
    default:
      return new Maybe(m.internal);
    }
  };

  static applyTo = <A, B>(m: Maybe<A>) => (f: (a: A) => B): Maybe<B> => m.map(f);
  static fromOptional = <A>(a: A | undefined): Maybe<A> => Maybe.from(I.fromOptional(a));
  static fromNullable = <A>(a: A | null | undefined): Maybe<A> => Maybe.from(I.fromNullable(a));
  static fromNumber = (a: number): Maybe<number> => Maybe.from(I.fromNumber(a));
  static nth = <A>(index: number, arr: Array<A>): Maybe<A> => Maybe.from(I.nth(index, arr));
  static first = <A>(arr: Array<A>): Maybe<A> => Maybe.from(I.first(arr));
  static last = <A>(arr: Array<A>): Maybe<A> => Maybe.from(I.last(arr));
  static find = <A, T extends readonly A[]>(f: (a: A) => boolean, arr: T): Maybe<A> => Maybe.from(I.find(f)(arr));
  static parseInt = (str: string): Maybe<number> => fromNumber(Number.parseInt(`${Number(str || 'NaN')}`));
  static parseFloat = (str: string): Maybe<number> => fromNumber(Number.parseFloat(`${Number(str || 'NaN')}`));

  static all = <T extends readonly Maybe<any>[] | []>(arr: T): Maybe<{ -readonly [P in keyof T]: MaybeType<T[P]> }> => {
    return (arr as readonly Maybe<any>[]).reduce(
      (acc: Maybe<{ -readonly [P in keyof T]: MaybeType<T[P]> }>, curr): Maybe<{ -readonly [P in keyof T]: MaybeType<T[P]> }> => {
        return acc.chain(
          a => curr.map((v) => [...(a as readonly unknown[]), v ] as unknown as { -readonly [P in keyof T]: MaybeType<T[P]> })
        );
      }, Just([] as unknown as { -readonly [P in keyof T]: MaybeType<T[P]> })) as Maybe<{ -readonly [P in keyof T]: MaybeType<T[P]> }>;
  };

  static some = <A extends Array<Maybe<any>>>(arr: A): Maybe<MaybeType<A[number]>> => {
    return arr.reduce((acc, curr): Maybe<MaybeType<A[number]>> => 
      acc.or(curr)
    , Nothing);
  };

  static values = <A extends Array<Maybe<any>>>(arr: A): Array<MaybeType<A[number]>> => {
    return arr.reduce((acc: Array<MaybeType<A[number]>>, curr: A[number]): Array<MaybeType<A[number]>> => 
      curr.fold<Array<MaybeType<A[number]>>>({
        nothing: () => acc,
        just: v => [...acc, v]
      }), []);
  };

  static record = <R extends Record<string, Maybe<any>>>(record: R): Maybe<{ -readonly [P in keyof R]: MaybeType<R[P]> }> => {
    return Object.entries(record).reduce((acc, [key, value]): Maybe<Partial<{ [P in keyof R]: MaybeType<R[P]> }>> => {
      return acc.chain((a) => value.map((v) => ({ ...a, [key]: v })));
    }, Just({})) as unknown as Maybe<{ [P in keyof R]: MaybeType<R[P]> }>;
  };

  static array = Maybe.all;
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
export const array = Maybe.array;
export const some = Maybe.some;
export const all = Maybe.all;
export const values = Maybe.values;
export const find = Maybe.find;
export const parseInt = Maybe.parseInt;
export const parseFloat = Maybe.parseFloat;
