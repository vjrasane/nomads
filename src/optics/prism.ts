/* BETA */

import { Iso } from './iso';
import { Maybe, Just } from '../monads/maybe';

export interface Prism<A, B> {
	readonly getOption: (a: A) => Maybe<B>,
	readonly reverseGet: (b: B) => A
	readonly modify: (fbb: (b: B) => B, a: A) => A,
  readonly modifyOption: (fbb: (b: B) => B, a: A) => Maybe<A>,
	readonly compose: <C>(prism: Prism<B, C>) => Prism<A, C>,
  readonly composeIso: <C>(iso: Iso<B, C>) => Prism<A, C>
}

export const Prism = <A, B>(prism: {
	getOption: (a: A) => Maybe<B>,
	reverseGet: (b: B) => A
}): Prism<A, B> => ({
    ...prism,
    modify: (fbb, a) => Prism(prism).modifyOption(fbb, a).getOrElse(a),
    modifyOption: (fbb, a) => prism.getOption(a).map(fbb).map(prism.reverseGet),
    compose: (pbc) => Prism({
      getOption: (a) => prism.getOption(a).chain(pbc.getOption),
      reverseGet: (c) => prism.reverseGet(pbc.reverseGet(c))
    }),
    composeIso: (ibc) => Prism({
      getOption: (a) => prism.getOption(a).map(ibc.get),
      reverseGet: (c) => prism.reverseGet(ibc.reverseGet(c))
    })
  });

export const fromIso = <A, B>(iso: Iso<A, B>): Prism<A, B> => Prism({
  getOption: (a) => Just(iso.get(a)),
  reverseGet: iso.reverseGet
});  
