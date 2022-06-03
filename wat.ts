export type Just<A> = {
    readonly tag: 'just';
    readonly value: A;
  };

  export type Nothing = {
    readonly tag: 'nothing';
  };

  export type Maybe<A> = Just<A> | Nothing;

  type AAA<B> = {};

  type AAAType<A> = A extends AAA<infer T> ? T : never;
  
  type D = AAAType<AAA<number>>

  type MaybeType<M> = M extends Maybe<infer T> ? T : M;


  type A = MaybeType<Maybe<number>>