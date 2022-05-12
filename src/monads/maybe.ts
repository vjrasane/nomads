import { Err, Ok, Result } from '../../result';

interface IMaybe<A> {
  readonly map: <B>(fab: (a: A) => B) => Maybe<B>,
  readonly chain: <B>(fab: (a: A) => Maybe<B>) => Maybe<B>,
  readonly fold: <B>(fab: (a: A) => B, fb: () => B) => B,
  readonly filter: (f: (a: A) => boolean) => Maybe<A>,
  readonly or: (a: Maybe<A>) => Maybe<A>,
  readonly default: (value: A) => Maybe<A>,
  readonly toResult: <E>(err: E) => Result<E, A>
  readonly get: () => A | undefined,
  readonly getOrElse: (def: A) => A
  readonly toString: () => string
}

interface Just<A> extends IMaybe<A> {
  readonly tag: 'just',
  readonly value: A
}

interface Nothing extends IMaybe<any> {
  readonly tag: 'nothing'
}

export type Maybe<A> = Just<A> | Nothing;

export const Just = <A>(value: A): Maybe<A> => ({
  tag: 'just',
  value,
  map: (fab) => Just(fab(value)),
  chain: (fab) => fab(value),
  filter: (f) => f(value) ? Just(value) : Nothing,
  fold: (fab) => fab(value),
  or: () => Just(value),
  default: () => Just(value),
  toResult: () => Ok(value),
  get: () => value,
  getOrElse: () => value,
  toString: () => `Just(${value})`
}); 

export const Nothing: Maybe<any> = ({
  tag: 'nothing',
  map: () => Nothing,
  chain: () => Nothing,
  filter: () => Nothing,
  fold: (fab, fb) => fb(),
  or: (a) => a,
  default: (value) => Just(value),
  toResult: (err) => Err(err),
  get: () => undefined,
  getOrElse: (def) => def,
  toString: () => 'Nothing'
}) as const; 

export const applyTo = <A, B>(a: Maybe<A>) => (f: (a: A) => B): Maybe<B> => a.map(f);  

export const fromOptional = <A>(a: A | undefined): Maybe<A> => {
  switch(a) {
  case undefined:
    return Nothing;
  default:
    return Just(a);
  }
};

export const fromNullable = <A>(a: A | null | undefined): Maybe<A> => {
  switch(a) {
  case undefined:
  case null:
    return Nothing;
  default:
    return Just(a);
  }
};

export const fromNumber = (a: number): Maybe<number> => {
  if(isNaN(a)) return Nothing;
  return Just(a);
};

export const nth = <A>(index: number, arr: Array<A>): Maybe<A> => fromOptional(arr[index]);

export const first = <A>(arr: Array<A>): Maybe<A> => nth(0, arr);

export const last = <A>(arr: Array<A>): Maybe<A> => nth(arr.length - 1, arr);

export const join = <A>(a: Maybe<Maybe<A>>): Maybe<A> => {
  switch (a.tag) {
  case 'just':
    return a.value;
  default:
    return a;
  }
};	  
