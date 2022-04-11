export type Pipe<A> = {
	value: A,
	then: <B>(fab: (a: A) => B) => Pipe<B>
}

export const pipe = <A>(value: A): Pipe<A> => {
  return ({
    value,
    then: <B>(f: (a: A) => B) => pipe(f(value))
  });
};

