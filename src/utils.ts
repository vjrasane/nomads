export type FunctionInputType<T> = 
  T extends (input: infer I, ...rest: any[]) => any ? I : never;

export type FunctionOutputType<T> = T extends (i: any) => infer O ? O : 
  T extends (i1: any, ...rest: infer R) => infer O ? (...rest: R) => O :
  T extends (...args: any) => any ? any :
  never

export const curry = (f: (...args: any[]) => any): (...args: any[]) => any => {
  const curried = (...cargs: any[]) => 
	  cargs.length >= f.length 
      ? f(...cargs)
      : (...args: any) => curried(...cargs, ...args);
  return curried;
};

export type NonEmptyArray<T> = [T, ...T[]];