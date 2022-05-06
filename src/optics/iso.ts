/* BETA */

export interface Iso<A, B> {
 readonly	get: (a: A) => B,
 readonly	reverseGet: (b: B) => A
 readonly	modify: (fbb: (b: B) => B, a: A) => A,
 readonly	compose: <C>(iso: Iso<B, C>) => Iso<A, C>,
 readonly	reverse: () => Iso<B, A>
}

export const Iso = <A, B>(iso: {
	get: (a: A) => B,
	reverseGet: (b: B) => A
}): Iso<A, B> => ({
    ...iso,
    modify: (fbb: (b: B) => B, a: A): A => iso.reverseGet(fbb(iso.get(a))),
    compose: (ibc) => Iso({
      get: (a) => ibc.get(iso.get(a)),
      reverseGet: (c) => iso.reverseGet(ibc.reverseGet(c))
    }),
    reverse: () => Iso({
      get: iso.reverseGet,
      reverseGet: iso.get
    })
  });
