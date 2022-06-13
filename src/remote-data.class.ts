import { Just, Maybe, Nothing } from "../maybe";
import { curry, FunctionInputType, FunctionOutputType } from "./utils";
import { Fold, RemoteData } from "./remote-data.api";

export type RemoteDataType<R> = R extends RemoteData<any, infer T>
  ? T : never;

export type ErrorType<R> = R extends RemoteData<infer T, any> ? T : never;

export type RemoteDataConstructType<
  A extends readonly RemoteData<unknown, unknown>[] | Record<string | symbol | number, RemoteData<unknown, unknown>>
> = { -readonly [P in keyof A]: RemoteDataType<A[P]> };


interface IRemoteData<E, A> {
	base: { tag: 'success', value: A } | { tag: 'failure', error: E } | { tag: 'loading' | 'not asked' }  
	map: <B>(fab: (a: A) => B) => RemoteData<E, B>,
	mapError: <F>(fef: (e: E) => F) => RemoteData<F, A>,
	chain: <B>(fab: (a: A) => RemoteData<E, B>) => RemoteData<E, B>,
	apply: (v: RemoteData<E, FunctionInputType<A>>) => RemoteData<E, FunctionOutputType<A>>
	join: () => A extends RemoteData<E, infer T> ? RemoteData<E, T> : never,
	fold: <B>(f: Fold<E, A, B>) => B,
	or: (ra: RemoteData<E, A>) => RemoteData<E, A>,
	orElse: (ra: RemoteData<E, A>) => RemoteData<E, A>,
	default: (a: A) => RemoteData<E, A>,
	toMaybe: () => Maybe<A>,
	get: () => A | undefined,
	getOrElse: (def: A) => A,
	getValue: () => Maybe<A>,
	getError: () => Maybe<E>,
	toString: () => string,
  }

abstract class ARemoteData<E, A> implements IRemoteData<E, A> {
	protected abstract self: RemoteData<E, A>;

	get base(): { tag: 'success', value: A } | { tag: 'failure', error: E } | { tag: 'loading' | 'not asked' }  {
		switch(this.self.tag) {
		  case "success":
			return { tag: 'success', value: this.self.value };
		  case "failure":
			return { tag: 'failure', error: this.self.error };
		default:
			return { tag: this.self.tag }
		}
	  }


	get = () => this.toMaybe().get();
	getOrElse = (def: A) => this.toMaybe().getOrElse(def);
	default = (def: A) => this.self.tag === "success" ? this.self : new Success<E, A>(def);
	or = (other: RemoteData<E, A>) => {
		switch(this.self.tag) {
			case "success":
				return this.self;
			default:
				return other.tag === "success" ? other : this.self;
		}
	}
	orElse = (other: RemoteData<E, A>) => other.or(this.self);
	map = <B>(fab: (a: A) => B): RemoteData<E, B> => {
		switch(this.self.tag) {
			case "success":
				return new Success<E, B>(fab(this.self.value));
			case "failure":
				return new Failure<E, B>(this.self.error);
			case "loading":
				return new Loading<E, B>();
			case "not asked":
				return new NotAsked<E, B>();
		}
	}
	
	mapError = <F>(fef: (e: E) => F):  RemoteData<F, A> => {
		switch(this.self.tag) {
			case "success":
				return new Success<F, A>(this.self.value);
			case "failure":
				return new Failure<F, A>(fef(this.self.error));
			case "loading":
				return new Loading<F, A>();
			case "not asked":
				return new NotAsked<F, A>();
		}
	}

	chain = <B>(fab: (a: A) => RemoteData<E, B>): RemoteData<E, B> => {
		switch(this.self.tag) {
			case "success":
				return fab(this.self.value);
			case "failure":
				return new Failure<E, B>(this.self.error);
			case "loading":
				return new Loading<E, B>();
			case "not asked":
				return new NotAsked<E, B>();
		}
	}
	apply = (ra: RemoteData<E, FunctionInputType<A>>): RemoteData<E, FunctionOutputType<A>> =>
		this.chain((f) => ra.map((a) => typeof f === 'function'
		  ? curry(f as unknown as (...args: any[]) => any)(a)
		  : a)) as RemoteData<E, FunctionOutputType<A>>;
	join = (): A extends RemoteData<E, infer T> ? RemoteData<E, T> : never =>
		this.chain(
		(m) => m instanceof ARemoteData
			? m as unknown as A extends RemoteData<E, infer T> ? RemoteData<E, T> : never
			: new Success(m) as unknown as A extends RemoteData<E, infer T> ? RemoteData<E, T> : never
		) as A extends RemoteData<E, infer T> ? RemoteData<E, T> : never;
	fold = <B>(f: Fold<E, A, B>) => {
		switch(this.self.tag) {
			case "success":
				return f.success(this.self.value);
			case "failure":
				return f.failure(this.self.error);
			case "loading":
				return f.loading();
			case "not asked":
				if ("not asked" in f) return  f["not asked"]();
				return f.notAsked();
		}
	} 
	toMaybe = () => this.getValue();
	getValue = () => this.self.tag === "success" ? Just(this.self.value) : Nothing<A>();
	getError = () => this.self.tag === "failure" ? Just(this.self.error) : Nothing<E>();
	toString = () => {
		switch(this.self.tag) {
		  case "success":
			return `Success(${this.self.value})`;
		  case "failure":
			return `Failure(${this.self.error})`;
		  case "loading":
			return `Loading`;
		  case "not asked":
			return `NotAsked`;
		}
	  };
}

export class Success<E, A> extends ARemoteData<E, A> {
	readonly tag = "success";

	constructor(readonly value: A) { super(); }

	protected self = this;
}  

export class Failure<E, A> extends ARemoteData<E, A> {
	readonly tag = "failure";

	constructor(readonly error: E) { super(); }

	protected self = this;
}  

export class Loading<E, A> extends ARemoteData<E, A> {
	readonly tag = "loading";

	protected self = this;
}  

export class NotAsked<E, A> extends ARemoteData<E, A> {
	readonly tag = "not asked";

	protected self = this;
}  
