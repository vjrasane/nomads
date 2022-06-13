import { Result } from "../result";
import * as Class from "./tuple.class";

export type Fold<E, A, B> = (first: E, second: A) => B
export type Tuple<E, A> = Class.Tuple<E, A>;

export const Tuple = <E, A>(first: E, second: A): Tuple<E, A> => new Class.Tuple<E, A>(first, second);

const fromArray = <A, B>([first, second]: [A, B]): Tuple<A, B> => Tuple(first, second);
const double = <A>(value: A): Tuple<A, A> => Tuple(value, value);

Tuple.fromArray = fromArray;
Tuple.double = double;
