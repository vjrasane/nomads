import { fromOptional, Just, Maybe } from '../../monads/maybe/maybe';
import { Result } from '../../monads/result/result';
import { Lens } from '../lens/lens';
import { Prism } from '../prism/prism';

export interface Optional<A, B> {
	readonly getOption : (a: A) => Maybe<B>
  readonly set : (b: B, a: A) => A
	readonly compose: <C>(optional: Optional<B, C>) => Optional<A, C>,
	readonly modify: (fbb: (b: B) => B, a: A) => A
	readonly modifyOption: (fbb: (b: B) => B, a: A) => Maybe<A>
}

export const Optional = <A, B>(optional: {
	getOption : (a: A) => Maybe<B>
  set : (b: B, a: A) => A
}): Optional<A, B> => ({
    ...optional,
    compose: (obc) => Optional({
      getOption: (a) => optional.getOption(a).chain(obc.getOption),
      set: (c, a) => Optional(optional).modify((b: B) => obc.set(c, b), a)
    }),
    modify: (fbb, a) => Optional(optional).modifyOption(fbb, a).getOrElse(a),
    modifyOption: (fbb, a) => optional.getOption(a).map(b => optional.set(fbb(b), a))
  });

export const maybe = <A>(): Optional<Maybe<A>, A> => Optional({
  getOption: (a) => a,
  set: (b, a) => a.map(() => b)
});

export const array = <A>(i: number): Optional<Array<A>, A> => Optional({
  getOption: (a) => fromOptional(a[i]),
  set: (b, a) => [...a].splice(i, 1, b)
});

export const record = <R extends Record<any, any>>(k: keyof R): Optional<R, R[keyof R]> => Optional({
  getOption: (a) => fromOptional(a[k]),
  set: (b, a) => ({ ...a, [k]: b })
});

export const result = <E, A>(): Optional<Result<E, A>, A> => Optional({
  getOption: (a) => a.toMaybe().get(),
  set: (b, a) => a.map(() => b)
});

export const fromPrism = <A, B>(prism: Prism<A, B>): Optional<A, B> => Optional({
  getOption: prism.getOption,
  set: prism.reverseGet
});

export const fromLens = <A, B>(lens: Lens<A, B>): Optional<A, B> => Optional({
  getOption: (a) => Just(lens.get(a)),
  set: lens.set
});

export const last = <A>(): Optional<Array<A>, A> => Optional({
  getOption: (a) => fromOptional(a[a.length - 1]),
  set: (b, a) => [...a, b]
});

export const first = <A>(): Optional<Array<A>, A> => Optional({
  getOption: (a) => fromOptional(a[0]),
  set: (b, a) => [b, ...a]
});