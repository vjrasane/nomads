
export const record = <R extends Record<string, Promise<any>>>(record: R): Promise<{ [P in keyof R]: Awaited<R[P]> }> => 
  Promise.all(Object.entries(record)
    .map(async ([key, value]) => [key, await value]))
    .then(entries => entries.reduce(
      (acc, [key, value]): Partial<{ [P in keyof R]: Awaited<R[P]> }> => ({
        ...acc, [key]: value
      }), {}
    ) as { [P in keyof R]: Awaited<R[P]> });
