/* BETA */

export type Iso<A, B> = {
	get: (a: A) => B,
	reverseGet: (b: B) => A
}

export const modify = <A, B>(iso: Iso<A, B>, fbb: (b: B) => B): (a: A) => A => {
  return (a: A) => iso.reverseGet(fbb(iso.get(a)));
};