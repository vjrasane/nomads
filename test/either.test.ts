import { Left, Right } from '../either';

describe('Either', () => {
  it('Left', () => {
    const left = Left(42);
    expect(left.base).toEqual({ tag: 'left', value: 42 });
    expect(left.tag).toEqual('left');
    expect(left.get()).toEqual(undefined);
    expect(left.value).toEqual(42);
    expect(left.getLeft().get()).toEqual(42);
    expect(left.getRight().get()).toEqual(undefined);
  });

  it('Right', () => {
    const right = Right(42);
    expect(right.base).toEqual({ tag: 'right', value: 42 });
    expect(right.tag).toEqual('right');
    expect(right.get()).toEqual(42);
    expect(right.value).toEqual(42);
    expect(right.getLeft().get()).toEqual(undefined);
    expect(right.getRight().get()).toEqual(42);
  });

  describe('mapLeft', () => {
    it('maps left', () => {
      expect(Left(42).mapLeft(n => n * 2).base).toEqual({ tag: 'left', value: 84 });
    });

    it('maps right', () => {
      expect(Right(42).mapLeft(n => n * 2).base).toEqual({ tag: 'right', value: 42 });
    });
  });

  describe('mapRight', () => {
    it('maps left', () => {
      expect(Left(42).map(n => n * 2).base).toEqual({ tag: 'left', value: 42 });
    });

    it('maps right', () => {
      expect(Right(42).map(n => n * 2).base).toEqual({ tag: 'right', value: 84 });
    });
  });

  describe('mapBoth', () => {
    it('maps left', () => {
      expect(Left(42)
        .mapLeft(n => n * 2)
        .map(() => 69)
        .base).toEqual({tag: 'left', value: 84});
    });

    it('maps right', () => {
      expect(Right(42)
        .mapLeft(() => 69)
        .map(n => n * 2)
        .base).toEqual({tag: 'right', value: 84});
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
      expect(Right(42).toResult().base).toEqual({
        tag: 'ok', value: 42
      });
    });

    it('gets err from left', () => {
      expect(Left('error').toResult().base).toEqual({
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
      expect(Left(42).swap().base).toEqual({
        tag: 'right', value: 42
      });
    });

    it('swaps right', () => {
      expect(Right(42).swap().base).toEqual({
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

  describe('join', () => {
    it('joins two right values', () => {
      const joined = Right(Right(42)).join();
      expect(joined.base).toEqual({ tag: 'right', value: 42 });
    });

    it('joins nested left value', () => {
      const joined = Right(Left(42)).join();
      expect(joined.base).toEqual({ tag: 'left', value: 42 });
    });

    it('joins left value', () => {
      const joined = Left(42).join();
      expect(joined.base).toEqual({ tag: 'left', value: 42 });
    });

    it('joins nested right value', () => {
      const joined = Left(Right(42)).join();
      expect(joined.getLeft().get()?.base).toEqual({ tag: 'right', value: 42 });
    });
    
    it('cannot join single right value', () => {
      const joined = Right(42).join();
      /* @ts-expect-error testing */
      expect(joined.base).toEqual({ tag: 'right', value: 42 });
    });
  });
});