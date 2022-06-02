
export const isNonOptional = <A>(a: A): a is NonOptional<A> => {
	return a !== undefined;
};

export const isNonNullable = <A>(a: A): a is NonNullable<A> => {
	return a != null;
};

export type NonOptional<T> = T extends undefined ? never : T;

export type Optional<A> = A | undefined;

export type Nullable<A> = Optional<A> | null;

export type NonEmptyArray<T> = [T, ...T[]];