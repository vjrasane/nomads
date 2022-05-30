
export const curry = (f: (...args: any[]) => any): (...args: any[]) => any => {
  const curried = (...cargs: any[]) => 
    cargs.length >= f.length 
      ? f(...cargs)
      : (...args: any) => curried(...cargs, ...args);
  return curried;
};

export type FunctionInputType<T> = 
  T extends (input: infer I, ...rest: any[]) => any ? I : never;

export type FunctionOutputType<T> = T extends (i: any) => infer O ? O : 
  T extends (i1: any, i2: infer I2) => infer O ? (i2: I2) => O :
  T extends (i1: any, i2: infer I2, i3: infer I3) => infer O ? (i2: I2, i3: I3) => O :
  T extends (i1: any, i2: infer I2, i3: infer I3, i4: infer I4) => infer O ? (i2: I2, i3: I3, i4: I4) => O :
  T extends (i1: any, i2: infer I2, i3: infer I3, i4: infer I4, i5: infer I5) => infer O ? (i2: I2, i3: I3, i4: I4, i5: I5) => O : 
  T extends (i1: any, i2: infer I2, i3: infer I3, i4: infer I4, i5: infer I5, i6: infer I6) => infer O ? (i2: I2, i3: I3, i4: I4, i5: I5, i6: I6) => O : 
  T extends (i1: any, i2: infer I2, i3: infer I3, i4: infer I4, i5: infer I5, i6: infer I6, i7: infer I7) => infer O ? (i2: I2, i3: I3, i4: I4, i5: I5, i6: I6, i7: I7) => O : 
  T extends (...args: any) => any ? any :
  never

export const isNonOptional = <A>(a: A): a is NonOptional<A> => {
  return a !== undefined;
};

export const isNonNullable = <A>(a: A): a is NonNullable<A> => {
  return a != null;
};

export type NonOptional<T> = T extends undefined ? never : T;

export type Optional<A> = A | undefined;

export type Nullable<A> = Optional<A> | null;

export type NonEmptyArray<T> = [T, ...T[]];

export const isType = <T>(
  symbol: symbol, value: any
): value is T => {
  if (typeof value !== "object") return false;
  if (!(symbol in value)) return false;
  return value[symbol] === symbol;
} 