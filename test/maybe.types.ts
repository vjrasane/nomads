/* eslint-disable @typescript-eslint/no-unused-vars */
import { Maybe, Just, MaybeConstructType, MaybeType, NestedMaybeType } from '../src/maybe';

type MaybeNumber = MaybeType<Maybe<number>>;
() => {
  const value: MaybeNumber = 42;
  const number: number = value;
};

type MaybeRecord = MaybeConstructType<{
  number: Maybe<number>,
  boolean: Maybe<boolean>,
  string: Maybe<string>
}>;
() => {
  const value: MaybeRecord = { number: 42, boolean: true, string: 'str' };
  const record: {
    number: number,
    boolean: boolean,
    string: string
  } = value;
  const returned = Maybe
    .record({ number: Just(42), boolean: Just(true), string: Just('str') })
    .getOrElse({ number: 42, boolean: true, string: 'str' });
  const reassign: MaybeRecord = returned;
};

type MaybeArray = MaybeConstructType<[
  Maybe<number>, Maybe<boolean>, Maybe<string>
]>;
() => {
  const value: MaybeArray = [42, true, 'str'];
  const record: [number, boolean, string] = value;
  const returned = Maybe
    .all([Just(42), Just(true), Just('str')])
    .getOrElse([42, true, 'str']);
  const reassign: MaybeRecord = returned;
};
