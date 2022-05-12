
import { Either, Left, Right } from "../either";
import { Just, Maybe, Nothing } from "../maybe";

type Ok<A> = { 
	readonly tag: "ok", 
	readonly value: A 
}

type Err<E> = { 
	readonly tag: "err", 
	readonly error: E
}


export type Result<E, A> = Ok<A> | Err<E>;

export const Ok = <A>(value: A): Result<any, A> => ({ tag: "ok", value });
export const Err = <E>(error: E): Result<E, any> => ({ tag: "err", error });

export const toOptional = <E, A>(r: Result<E, A>): A | undefined => {
	switch(r.tag) {
		case "ok":
			return r.value;
		default:
			return undefined;
	}
}

export const map = <E, A, B>(fab: (a: A) => B) => (ra: Result<E, A>): Result<E, B> => {
	switch(ra.tag) {
		case "ok":
			return Ok(fab(ra.value));
		default:
			return ra;
	}
}

export const mapError = <E, A, B>(feb: (e: E) => B) => (ra: Result<E, A>): Result<B, A> => {
	switch(ra.tag) {
		case "ok":
			return ra;
		default:
			return Err(feb(ra.error));
	}
}

export const chain = <E, A, B>(fab: (a: A) => Result<E, B>) => (ra: Result<E, A>): Result<E, B> => {
	switch(ra.tag) {
		case "ok":
			return fab(ra.value);
		default:
			return ra;
	}
}

export const fold = <E, A, B>(feb: (e: E) => B, fab: (a: A) => B) => (ra: Result<E, A>): B => {
	switch(ra.tag) {
		case "ok":
			return fab(ra.value);
		default:
			return feb(ra.error);
	}
}

export const or = <E, A>(first: Result<E, A>) => (second: Result<E, A>): Result<E, A> => {
	switch(first.tag) {
		case "ok":
			return first;
		default:
			return mapError<E, A, E>(() => first.error)(second);
	}
}

export const orElse = <E, A>(first: Result<E, A>) => (second: Result<E, A>): Result<E, A> => or(second)(first)

export const defaultTo = <E, A>(def: A) => (r: Result<E, A>): Result<E, A> => {
	switch(r.tag) {
		case "ok":
			return r;
		default:
			return Ok(def);
	}
}

export const toEither = <E, A>(r: Result<E, A>): Either<E, A> => {
	switch(r.tag) {
		case "ok":
			return Right(r.value);
		default:
			return Left(r.error);
	}
}

export const toMaybe = <E, A>(r: Result<E, A>): Maybe<A> => getValue(r)

export const getError = <E, A>(r: Result<E, A>): Maybe<E> => {
	switch(r.tag) {
		case "ok":
			return Nothing;
		default:
			return Just(r.error);
	}
}


export const getValue = <E, A>(r: Result<E, A>): Maybe<A> => {
	switch(r.tag) {
		case "ok":
			return Just(r.value);
		default:
			return Nothing;
	}
}

export const toString = <E, A>(r: Result<E, A>): string => {
	switch(r.tag) {
		case "ok":
			return `Ok(${r.value})`;
		default:
			return `Err(${r.error})`;
	}
}