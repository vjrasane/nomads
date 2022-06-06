import { Either } from "../either";
import { Just, Maybe, Nothing } from "../maybe";
import { curry, FunctionInputType, FunctionOutputType } from "./function";
import { Fold, Result } from "./result";


interface IResult<E, A> {
	base: { tag: 'ok', value: A } | { tag: 'err', error: E }
	map: <B>(fab: (a: A) => B) => Result<E, B>,
	mapError: <F>(fef: (e: E) => F) => Result<F, A>,
	chain: <B>(fab: (a: A) => Result<E, B>) => Result<E, B>,
	apply: (v: Result<E, FunctionInputType<A>>) => Result<E, FunctionOutputType<A>>
	join: () => A extends Result<E, infer T> ? Result<E, T> : never,
	fold: <B>(f: Fold<E, A, B>) => B,
	or: (ra: Result<E, A>) => Result<E, A>,
	orElse: (ra: Result<E, A>) => Result<E, A>,
	default: (a: A) => Result<E, A>,
	toMaybe: () => Maybe<A>,
	get: () => A | undefined,
	getOrElse: (def: A) => A,
	getValue: () => Maybe<A>,
	getError: () => Maybe<E>,
	toString: () => string,
  }

abstract class AResult<E, A> implements IResult<E, A> {
	protected abstract self: Result<E, A>;

	get base(): { tag: 'ok', value: A } | { tag: 'err', error: E }  {
		switch(this.self.tag) {
		  case "ok":
			return { tag: 'ok', value: this.self.value };
		default:
			return { tag: "err", error: this.self.error }
		}
	  }


	get = () => this.toMaybe().get();
	getOrElse = (def: A) => this.toMaybe().getOrElse(def);
	default = (def: A) => this.self.tag === "ok" ? this.self : new Ok(def);
	or = (other: Result<E, A>) => {
		switch(this.self.tag) {
			case "ok":
				return this.self;
			default:
				return other.tag === "ok" ? other : this.self;
		}
	}
	orElse = (other: Result<E, A>) => other.or(this.self);
	map = <B>(fab: (a: A) => B): Result<E, B> => this.self.tag === "ok" 
    ? new Ok(fab(this.self.value)) 
    : new Err(this.self.error)
	mapError = <F>(fef: (e: E) => F): Result<F, A> => this.self.tag === "ok" 
    ? new Ok(this.self.value) 
    : new Err(fef(this.self.error))

	chain = <B>(fab: (a: A) => Result<E, B>): Result<E, B> => this.self.tag === "ok"
		? fab(this.self.value) : new Err(this.self.error);
	apply = (ra: Result<E, FunctionInputType<A>>): Result<E, FunctionOutputType<A>> =>
		this.chain((f) => ra.map((a) => typeof f === 'function'
		  ? curry(f as unknown as (...args: any[]) => any)(a)
		  : a)) as Result<E, FunctionOutputType<A>>;
	join = (): A extends Result<E, infer T> ? Result<E, T> : never =>
		this.chain(
		(m) => m instanceof AResult
			? m as unknown as A extends Result<E, infer T> ? Result<E, T> : never
			: new Ok(m) as unknown as A extends Result<E, infer T> ? Result<E, T> : never
		) as A extends Result<E, infer T> ? Result<E, T> : never;
	fold = <B>(f: Fold<E, A, B>) => this.self.tag === "ok" ? f.ok(this.self.value) : f.err(this.self.error);
	toMaybe = () => this.getValue();
	getValue = () => this.self.tag === "ok" ? Just(this.self.value) : Nothing<A>();
	getError = () => this.self.tag === "ok" ? Nothing<E>() : Just(this.self.error);
	toString = () => {
		switch(this.self.tag) {
		  case "ok":
			return `Ok(${this.self.value})`;
		  default:
			return `Err(${this.self.error})`;
		}
	  };
}

export class Ok<E, A> extends AResult<E, A> {
	readonly tag = "ok";

	constructor(readonly value: A) { super(); }

	protected self = this;
}  

export class Err<E, A> extends AResult<E, A> {
	readonly tag = "err";

	constructor(readonly error: E) { super(); }

	protected self = this;
}  