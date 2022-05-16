

export type NonEmptyArray<T> = [T, ...T[]];

export const map = <A, B>(fab: (a: A) => B) => ([a, ...rest]: NonEmptyArray<A>): NonEmptyArray<B> => {
  return [fab(a), ...rest.map(fab)];
};

export const first = <A>([a]: NonEmptyArray<A>): A => {
  return a;
};

export const last = <A>([a, ...rest]: NonEmptyArray<A>): A => {
  return rest.length ? rest[rest.length - 1] : a;
};