
type TypeOfPromise<P> = P extends Promise<infer T> ? T : never;

export const record = <R extends Record<string, Promise<any>>>(record: R): Promise<{ [P in keyof R]: TypeOfPromise<R[P]> }> => 
  Promise.all(Object.entries(record)
    .map(async ([key, value]) => [key, await value]))
    .then(entries => entries.reduce(
      (acc, [key, value]): Partial<{ [P in keyof R]: TypeOfPromise<R[P]> }> => ({
        ...acc, [key]: value
      }), {}
    ) as { [P in keyof R]: TypeOfPromise<R[P]> });
