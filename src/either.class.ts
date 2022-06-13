import { Just, Maybe, Nothing } from "../maybe";
import Result, { Err, Ok } from "../result";
import { Either, Fold } from "./either.api";
import { Tuple } from "../tuple";
import { curry, FunctionInputType, FunctionOutputType } from "./utils";

export type EitherType<R> = R extends Either<any, infer T>
  ? T : never;

export type LeftType<R> = R extends Either<infer T, any> ? T : never;

export type EitherConstructType<
  A extends readonly Either<unknown, unknown>[] | Record<string | symbol | number, Either<unknown, unknown>>
> = { -readonly [P in keyof A]: EitherType<A[P]> };


interface IEither<E, A> {
	base: { tag: 'left', value: E } | { tag: 'right', value: A }
	map: <B>(fab: (a: A) => B) => Either<E, B>,
	mapLeft: <F>(fef: (e: E) => F) => Either<F, A>,
	chain: <B>(fab: (a: A) => Either<E, B>) => Either<E, B>,
	apply: (v: Either<E, FunctionInputType<A>>) => Either<E, FunctionOutputType<A>>
	join: () => A extends Either<E, infer T> ? Either<E, T> : never,
	swap: () => Either<A, E>,
	fold: <B>(f: Fold<E, A, B>) => B,
	or: (ra: Either<E, A>) => Either<E, A>,
	orElse: (ra: Either<E, A>) => Either<E, A>,
	default: (a: A) => Either<E, A>,
	toMaybe: () => Maybe<A>,
	toResult: () => Result<E, A>,
	toTuple: () => Tuple<Maybe<E>, Maybe<A>>
	get: () => A | undefined,
	getOrElse: (def: A) => A,
	getRight: () => Maybe<A>,
	getLeft: () => Maybe<E>,
	toString: () => string,
  }

abstract class AEither<E, A> implements IEither<E, A> {
	protected abstract self: Either<E, A>;

	get base(): { tag: 'left', value: E } | { tag: 'right', value: A }  {
		switch(this.self.tag) {
		  case "left":
			return { tag: 'left', value: this.self.value };
		default:
			return { tag: "right", value: this.self.value }
		}
	  }


	get = () => this.toMaybe().get();
	getOrElse = (def: A) => this.toMaybe().getOrElse(def);
	default = (def: A) => this.self.tag === "right" ? this.self : new Right<E, A>(def);
	or = (other: Either<E, A>) => {
		switch(this.self.tag) {
			case "right":
				return this.self;
			default:
				return other.tag === "right" ? other : this.self;
		}
	}
	orElse = (other: Either<E, A>) => other.or(this.self);
	map = <B>(fab: (a: A) => B): Either<E, B> => this.self.tag === "right" 
    ? new Right<E, B>(fab(this.self.value)) 
    : new Left<E, B>(this.self.value)
	mapLeft = <F>(fef: (e: E) => F): Either<F, A> => this.self.tag === "right" 
    ? new Right<F, A>(this.self.value) 
    : new Left<F, A>(fef(this.self.value))

	chain = <B>(fab: (a: A) => Either<E, B>): Either<E, B> => this.self.tag === "right"
		? fab(this.self.value) : new Left(this.self.value);
	apply = (ra: Either<E, FunctionInputType<A>>): Either<E, FunctionOutputType<A>> =>
		this.chain((f) => ra.map((a) => typeof f === 'function'
		  ? curry(f as unknown as (...args: any[]) => any)(a)
		  : a)) as Either<E, FunctionOutputType<A>>;
	join = (): A extends Either<E, infer T> ? Either<E, T> : never =>
		this.chain(
		(m) => m instanceof AEither
			? m as unknown as A extends Either<E, infer T> ? Either<E, T> : never
			: new Right(m) as unknown as A extends Either<E, infer T> ? Either<E, T> : never
		) as A extends Either<E, infer T> ? Either<E, T> : never;
	swap = () => this.self.tag === "right" ? new Left<A, E>(this.self.value) : new Right<A, E>(this.self.value)
	fold = <B>(f: Fold<E, A, B>) => this.self.tag === "right" ? f.right(this.self.value) : f.left(this.self.value);
	toMaybe = () => this.getRight();
	toResult = () => this.self.tag === "right" ? Ok(this.self.value) : Err(this.self.value);
	toTuple = () => Tuple(this.getLeft(), this.getRight());
	getRight = () => this.self.tag === "right" ? Just(this.self.value) : Nothing<A>();
	getLeft = () => this.self.tag === "right" ? Nothing<E>() : Just(this.self.value);
	toString = () => {
		switch(this.self.tag) {
		  case "right":
			return `Right(${this.self.value})`;
		  default:
			return `Left(${this.self.value})`;
		}
	  };
}

export class Right<E, A> extends AEither<E, A> {
	readonly tag = "right";

	constructor(readonly value: A) { super(); }

	protected self = this;
}  

export class Left<E, A> extends AEither<E, A> {
	readonly tag = "left";

	constructor(readonly value: E) { super(); }

	protected self = this;
}  
