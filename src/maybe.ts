
export type Just<T> = { tag: 'just', value: T };

/**
 * Wraps given value to a Maybe value
 * 
 * @template T
 * @param {T} value value to be wrapped
 * @returns {Maybe<T>} maybe value of T
 */
export const just = <T>(value: T): Maybe<T> => ({ tag: 'just', value });

/**
 * Check if given maybe value is Just
 * 
 * @template T
 * @param {Maybe<T>} value value to be checked
 * @returns {boolean} whether maybe is Just
 */
export const isJust = <T>(maybe: Maybe<T>): maybe is Just<T> => maybe.tag === 'just';

export type Nothing = { tag: 'nothing' };

/**
 * Check if given maybe value is Nothing
 * 
 * @template T
 * @param {Maybe<T>} value value to be checked
 * @returns {boolean} whether maybe is Nothing
 */
export const isNothing = <T>(maybe: Maybe<T>): maybe is Nothing => maybe.tag === 'nothing';

/**
 * Maybe value representing no present value
 */
export const nothing: Maybe<never> = { tag: 'nothing' };

export type Maybe<T> = Just<T> | Nothing;

/**
 * Transform a Maybe value with a given function
 * 
 * @template A
 * @template B
 * @param {Function} fab mapper function from A to B
 * @param {Maybe<A>} ma maybe value of A
 * @returns {Maybe<B>} maybe value of B
 */
export const map = <A, B>(fab: (a: A) => B, ma: Maybe<A>): Maybe<B> => {
  switch (ma.tag) {
  case 'just':
    return just(fab(ma.value));
  default:
    return ma;
  }
};

export const andThen = <A, B>(fab: (a: A) => Maybe<B>, a: Maybe<A>): Maybe<B> => {
  switch (a.tag) {
  case 'just':
    return fab(a.value);
  default:
    return a;
  }
};

export const andMap = <A, B>(fab: Maybe<(a: A) => B>, a: Maybe<A>): Maybe<B> => {
  switch (fab.tag) {
  case 'just':
    return map(fab.value, a);
  default:
    return fab;
  }
};


export const withDefault = <A>(defaultValue: A, a: Maybe<A>): A => {
  switch(a.tag) {
  case 'just':
    return a.value;
  default:
    return defaultValue;
  }
};

export const toOptional = <A>(a: Maybe<A>): A | undefined => withDefault(undefined, a);

export const join = <A>(a: Maybe<Maybe<A>>): Maybe<A> => {
  switch (a.tag) {
  case 'just':
    return a.value;
  default:
    return a;
  }
};	  

export const unwrap = <A, B>(def: B, fab: (a: A) => B, a: Maybe<A>): B => {
  return withDefault(def, map(fab, a));
};

export const filter = <A>(p: (a : A) => boolean, a: Maybe<A>): Maybe<A> => {
  return unwrap(false, p, a) ? a : nothing;
};

export const or = <A>(first: Maybe<A>, second: Maybe<A>): Maybe<A> => {
  switch(first.tag) {
  case 'just':
    return first;
  default:
    return second;
  }
}; 

export const next = <A>(first: Maybe<A>, second: Maybe<A>): Maybe<A> => {
  switch(first.tag) {
  case 'nothing':
    return nothing;
  default:
    return second;
  }
};

export const prev = <A>(first: Maybe<A>, second: Maybe<A>): Maybe<A> => {
  switch(second.tag) {
  case 'nothing':
    return nothing;
  default:
    return first;
  }
};

export const orElse = <A>(first: Maybe<A>, second: Maybe<A>): Maybe<A> => {
  return or(second, first);
}; 

export const values = <A>(arr: Array<Maybe<A>>): Array<A> => {
  return arr.filter(isJust).map(({ value }) => value);
};

export const combine = <A>(arr: Array<Maybe<A>>): Maybe<Array<A>> => {
  const justs = values(arr);
  return justs.length === arr.length ? just(justs) : nothing;
};

export const traverse = <A, B>(fab: (a: A) =>  Maybe<B>, arr: Array<A>): Maybe<Array<B>> => {
  return combine(arr.map(fab));
};

export const cons = <A>(arr: Array<A>, a: Maybe<A>) => {
  return unwrap(arr, (a: A) => [a, ...arr], a);
};

export const fromOptional = <A>(a: A | undefined): Maybe<A> => {
  switch(a) {
  case undefined:
    return nothing;
  default:
    return just(a);
  }
};

export const fromNullable = <A>(a: A | null | undefined): Maybe<A> => {
  switch(a) {
  case undefined:
  case null:
    return nothing;
  default:
    return just(a);
  }
};

export const fromNumber = (a: number): Maybe<number> => {
  if(isNaN(a)) return nothing;
  return just(a);
};

export const couple = <A, B, C>(
  fabc: (a: A, b: B) => C,
  qa: Maybe<A>, qb: Maybe<B>): Maybe<C> => {
  const curried = (a: A) => (b: B): C => fabc(a, b);
  return andMap(map(curried, qa), qb);
};