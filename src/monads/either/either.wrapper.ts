import { Result } from '../../../result';
import { Maybe } from '../../../maybe';
import * as I from './either.internal';

export class Either<A, B> {
  constructor(private readonly internal: I.Either<A, B>) { }

  get tag(): I.Either<A, B>['tag'] {
    return this.internal.tag;
  }

  get value(): A | B {
    return this.internal.value;
  }

  get either(): I.Either<A, B> {
    return this.internal;
  }

  private apply = <C, D>(
    f: (ra: I.Either<A, B>) => I.Either<C, D>
  ): Either<C, D> => new Either(f(this.internal));

  mapRight = <C>(fbc: (b: B) => C): Either<A, C> => this.apply(I.mapRight(fbc));
  mapLeft = <C>(fac: (a: A) => C): Either<C, B> => this.apply(I.mapLeft(fac));
  fold = <C>(fac: (a: A) => C, fbc: (b: B) => C): C => I.fold(fac, fbc)(this.internal);
  toResult = (): Result<A, B> => I.toResult(this.internal);
  get = (): A | B => this.value;
  getLeft = (): Maybe<A> => I.getLeft(this.internal);
  getRight = (): Maybe<B> => I.getRight(this.internal);
  toString = (): string => I.toString(this.internal);

  static from = <A, B>(e: I.Either<A, B>) => new Either(e);
  static Left = <A>(value: A): Either<A, any> => new Either(I.Left(value));
  static Right = <A>(value: A): Either<any, A> => new Either(I.Right(value));
}

export const Left = Either.Left;
export const Right = Either.Right;
