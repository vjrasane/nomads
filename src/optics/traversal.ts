import { Iso } from './iso';
import { Lens } from './lens';
import { Optional } from './optional';
import { Prism } from './prism';

export interface Traversal<A, B> {
	readonly traverse: (fbb: (b: B) => B, a: A) => A,
	readonly some: (f: (b: B) => boolean) => Traversal<A, B>
	readonly modify: (fbb: (b: B) => B, a: A) => A,
	readonly compose: <C>(trav: Traversal<B, C>) => Traversal<A, C>,
	readonly composeIso: <C>(iso: Iso<B, C>) => Traversal<A, C>,
	readonly composeLens: <C>(lens: Lens<B, C>) => Traversal<A, C>,
	readonly composePrism: <C>(prism: Prism<B, C>) => Traversal<A, C>,
	readonly composeOptional: <C>(opt: Optional<B, C>) => Traversal<A, C>,
}

export const Traversal = <A, B>(traversal: {
	traverse: (fbb: (b: B) => B, a: A) => A,
}): Traversal<A, B> =>({
    ...traversal,
    some: (f) => Traversal({
      traverse: (fbb, a) => traversal.traverse((b) => f(b) ? fbb(b) : b, a)
    }),
    modify: (fbb, a) => traversal.traverse(fbb, a),
    compose: (tbc) => Traversal({
      traverse: (fcc, a) => traversal.traverse(
        (b: B) => tbc.modify(fcc, b), a)
    }),
    composeIso: (ibc) => Traversal({
      traverse: (fcc, a) => traversal.traverse(
        (b: B) => ibc.modify(fcc, b), a)
    }),
    composeLens: (lbc) => Traversal({
      traverse: (fcc, a) => traversal.traverse(
        (b: B) => lbc.modify(fcc, b), a)
    }),
    composePrism: (pbc) => Traversal({
      traverse: (fcc, a) => traversal.traverse(
        (b: B) => pbc.modify(fcc, b), a)
    }),
    composeOptional: (obc) => Traversal({
      traverse: (fcc, a) => traversal.traverse(
        (b: B) => obc.modify(fcc, b), a)
    }),
  });

export const array = <T>(): Traversal<Array<T>, T> => Traversal(
  { traverse: (fbb, a) => a.map(fbb) }
);

export const values = <R extends Record<any, any>>(): Traversal<R, R[keyof R]> => Traversal({
  traverse: (fbb, a) => Object.entries(a).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: fbb(value) }), 
    {} as R)
}); 
