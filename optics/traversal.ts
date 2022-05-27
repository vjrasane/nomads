import { Iso } from './iso';
import { Lens } from './lens';
import { Optional } from './optional';
import { Prism } from './prism';

export interface Traversal<A, B> {
  readonly modify: (fbb: (b: B) => B, a: A) => A;
  readonly some: (f: (b: B) => boolean) => Traversal<A, B>;
  readonly compose: <C>(trav: Traversal<B, C>) => Traversal<A, C>;
  readonly composeIso: <C>(iso: Iso<B, C>) => Traversal<A, C>;
  readonly composeLens: <C>(lens: Lens<B, C>) => Traversal<A, C>;
  readonly composePrism: <C>(prism: Prism<B, C>) => Traversal<A, C>;
  readonly composeOptional: <C>(opt: Optional<B, C>) => Traversal<A, C>;
}

export const Traversal = <A, B>(modify: (fbb: (b: B) => B, a: A) => A): Traversal<A, B> => ({
  modify,
  some: (f) => Traversal( (fbb, a) => modify((b) => (f(b) ? fbb(b) : b), a)),
  compose: (tbc) => Traversal((fcc, a) => modify((b: B) => tbc.modify(fcc, b), a)),
  composeIso: (ibc) => Traversal((fcc, a) => modify((b: B) => ibc.modify(fcc, b), a)),
  composeLens: (lbc) => Traversal((fcc, a) => modify((b: B) => lbc.modify(fcc, b), a)),
  composePrism: (pbc) => Traversal((fcc, a) => modify((b: B) => pbc.modify(fcc, b), a)),
  composeOptional: (obc) => Traversal((fcc, a) => modify((b: B) => obc.modify(fcc, b), a)),
});

export const array = <T>(): Traversal<Array<T>, T> => Traversal((fbb, a) => a.map(fbb));

export const values = <R extends Record<any, any>>(): Traversal<R, R[keyof R]> =>
  Traversal(
    (fbb, a) => Object.entries(a).reduce((acc, [key, value]) => ({ ...acc, [key]: fbb(value) }), {} as R),
  );
