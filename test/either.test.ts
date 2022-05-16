import { Left, Right } from '../either';

describe('Either', () => {
  it('Left', () => {
    const left = Left(42);
    expect(left.either).toEqual({ tag: 'left', value: 42 });
    expect(left.tag).toEqual('left');
    expect(left.value).toEqual(42);
    expect(left.getLeft().get()).toEqual(42);
    expect(left.getRight().get()).toEqual(undefined);
  });

  it('Right', () => {
    const right = Right(42);
    expect(right.either).toEqual({ tag: 'right', value: 42 });
    expect(right.tag).toEqual('right');
    expect(right.value).toEqual(42);
    expect(right.getLeft().get()).toEqual(undefined);
    expect(right.getRight().get()).toEqual(42);
  });

  describe('mapLeft', () => {
    it('maps left', () => {
      expect(Left(42).mapLeft(n => n * 2).either).toEqual({ tag: 'left', value: 84 });
    });

    it('maps right', () => {
      expect(Right(42).mapLeft(n => n * 2).either).toEqual({ tag: 'right', value: 42 });
    });
  });

  describe('mapRight', () => {
    it('maps left', () => {
      expect(Left(42).mapRight(n => n * 2).either).toEqual({ tag: 'left', value: 42 });
    });

    it('maps right', () => {
      expect(Right(42).mapRight(n => n * 2).either).toEqual({ tag: 'right', value: 84 });
    });
  });

  describe('mapBoth', () => {
    it('maps left', () => {
      expect(Left(42).mapBoth(
        n => n * 2,
        () => 69
      ).either).toEqual({tag: 'left', value: 84});
    });

    it('maps right', () => {
      expect(Right(42).mapBoth(
        () => 69,
        n => n * 2
      ).either).toEqual({tag: 'right', value: 84});
    });
  });

  describe('fold', () => {
    it('folds left', () => {
      expect(Left(42).fold({
        left: n => n * 2,
        right: () => 69
      })).toEqual(84);
    });

    it('folds right', () => {
      expect(Right(42).fold({
        right: n => n * 2,
        left: () => 69
      })).toEqual(84);
    });
  });

  describe('toResult', () => {
    it('gets ok from right', () => {
      expect(Right(42).toResult().result).toEqual({
        tag: 'ok', value: 42
      });
    });

    it('gets err from left', () => {
      expect(Left('error').toResult().result).toEqual({
        tag: 'err', error: 'error'
      });
    });
  });

  describe('toTuple', () => {
    it('gets tuple from right', () => {
      const tuple = Right(42).toTuple();
      expect(tuple.first.get()).toBe(undefined);
      expect(tuple.second.get()).toBe(42);
    });

    it('gets tuple from left', () => {
      const tuple = Left(42).toTuple();
      expect(tuple.first.get()).toBe(42);
      expect(tuple.second.get()).toBe(undefined);
    });
  });

  describe('swap', () => {
    it('swaps left', () => {
      expect(Left(42).swap().either).toEqual({
        tag: 'right', value: 42
      });
    });

    it('swaps right', () => {
      expect(Right(42).swap().either).toEqual({
        tag: 'left', value: 42
      });
    });
  });

  describe('toString', () => {
    it('prints right', () => {
      expect(Right(42).toString()).toBe('Right(42)');
    });

    it('prints left', () => {
      expect(Left(42).toString()).toBe('Left(42)');
    });
  });
});