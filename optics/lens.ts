/* BETA */

import { Tuple } from '../tuple';

export interface Lens<A, B> {
  readonly get: (a: A) => B;
  readonly set: (b: B, a: A) => A;
  readonly compose: <C>(lens: Lens<B, C>) => Lens<A, C>;
  readonly modify: (fbb: (b: B) => B, a: A) => A;
}

export const Lens = <A, B>(lens: { get: (a: A) => B; set: (b: B, a: A) => A }): Lens<A, B> => ({
  ...lens,
  compose: (lbc) =>
    Lens({
      get: (a) => lbc.get(lens.get(a)),
      set: (c, a) => lens.set(lbc.set(c, lens.get(a)), a),
    }),
  modify: (fbb, a) => lens.set(fbb(lens.get(a)), a),
});

export const prop = <R extends Record<any, any>>(key: keyof R): Lens<R, R[keyof R]> =>
  Lens({
    get: (a) => a[key],
    set: (b, a) => ({ ...a, [key]: b }),
  });

export const id = <I, R extends { id: I } & Record<any, any>>(): Lens<R, I> =>
  Lens({
    get: (a) => a.id,
    set: (b, a) => ({ ...a, id: b }),
  });

export const first = <A, B>(): Lens<Tuple<A, B>, A> =>
  Lens({
    get: (a) => a.first,
    set: (b, a) => a.mapFirst(() => b),
  });

export const second = <A, B>(): Lens<Tuple<A, B>, B> =>
  Lens({
    get: (a) => a.second,
    set: (b, a) => a.mapSecond(() => b),
  });
