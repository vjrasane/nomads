import { boolean } from "fp-ts";
import { Result } from "../../../result";
import * as I from "./maybe.internal";

export class Maybe<A> {
	constructor(private readonly internal: I.Maybe<A>) {}

	get value(): A | undefined {
		return I.toOptional(this.internal)
	}

	private apply = <B>(
		f: (ra: I.Maybe<A>) => I.Maybe<B>
	): Maybe<B> => new Maybe(f(this.internal))

	map = <B>(fab: (a: A) => B): Maybe<B> => this.apply(I.map(fab))
	chain = <B>(fab: (a: A) => Maybe<B>): Maybe<B> => Maybe.join(this.apply(I.map(fab)))
	filter = (f: (a : A) => boolean): Maybe<A> => this.apply(I.filter(f))
	fold = <B>(fb: () => B, fab: (a: A) => B): B => I.fold(fb, fab)(this.internal)
	or = (m: Maybe<A>) => this.apply(I.orElse(m.internal))
	orElse = (m: Maybe<A>) => this.apply(I.or(m.internal))
	default = (a: A) => this.apply(I.defaultTo(a))
	toResult = <E>(err: E): Result<E, A> => I.toResult<E, A>(err)(this.internal)
	get = (): A | undefined => this.value
	getOrElse = (def: A) => I.getOrElse(def)(this.internal)
	toString = (): string => I.toString(this.internal)
	unwrap = (): I.Maybe<A> => this.internal

	static Just = <A>(value: A): Maybe<A> => new Maybe<A>(I.Just(value));
	
	static Nothing: Maybe<any> = new Maybe<any>(I.Nothing)

	static join = <A>(m: Maybe<Maybe<A>>): Maybe<A>  => {
		switch(m.internal.tag) {
			case "just":
				return m.internal.value;
			default:
				return new Maybe(m.internal)
		}
	}

	static applyTo = <A, B>(m: Maybe<A>) => (f: (a: A) => B): Maybe<B> => m.map(f)
	static fromOptional = <A>(a: A | undefined): Maybe<A> => new Maybe(I.fromOptional(a));
	static fromNullable = <A>(a: A | null | undefined): Maybe<A> => new Maybe(I.fromNullable(a));
	static fromNumber = (a: number): Maybe<number> => new Maybe(I.fromNumber(a));
	static nth = <A>(index: number, arr: Array<A>): Maybe<A> => new Maybe(I.nth(index, arr));
	static first = <A>(arr: Array<A>): Maybe<A> => new Maybe(I.first(arr));
	static last = <A>(arr: Array<A>): Maybe<A> => new Maybe(I.last(arr));
}

export const Just = Maybe.Just;
export const Nothing = Maybe.Nothing;
export const join = Maybe.join;
export const applyTo = Maybe.applyTo;
export const fromOptional = Maybe.fromOptional;
export const fromNullable = Maybe.fromNullable;
export const fromNumber = Maybe.fromNumber;
export const nth = Maybe.nth;
export const first = Maybe.first;
export const last = Maybe.last;
