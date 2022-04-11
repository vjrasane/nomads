

export type Tuple<A, B> = { tag: 'tuple', first: A, second: B };

export const tuple = <A, B>(first: A, second: B): Tuple<A, B> => ({ tag: 'tuple', first, second});

export const first = <A, B>(ab: Tuple<A, B>): A => ab.first;

export const second = <A, B>(ab: Tuple<A, B>): B => ab.second;

export const fromArray = <A, B>([a, b]: [A, B]): Tuple<A, B> => tuple(a, b);

export const toArray = <A, B>(ab: Tuple<A, B>): [A, B] => [ab.first, ab.second];

export const mapFirst = <A, B, C>(fab: (a: A) => B, ac: Tuple<A, C>): Tuple<B, C> => tuple(fab(ac.first), ac.second);

export const mapSecond = <A, B, C>(fab: (a: A) => B, ac: Tuple<C, A>): Tuple<C, B> => tuple(ac.first, fab(ac.second));

export const mapBoth = <A, B, X, Y>(fax: (a: A) => X, fay: (b: B) => Y, 
  ab: Tuple<A, B>): Tuple<X, Y> => tuple(fax(ab.first), fay(ab.second));

export const swap = <A, B>(ab: Tuple<A, B>): Tuple<B, A> => tuple(ab.second, ab.first);

export const double = <A>(a: A): Tuple<A, A> => tuple(a,a);