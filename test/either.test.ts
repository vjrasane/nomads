import Either, { Left, Right } from '../either';

describe('Either', () => {
  it('Left', () => {
    const left = Either.Left(42);
    expect(left.base).toEqual({ tag: 'left', value: 42 });
    expect(left.tag).toEqual('left');
    expect(left.get()).toEqual(undefined);
    expect(left.value).toEqual(42);
    expect(left.getLeft().get()).toEqual(42);
    expect(left.getRight().get()).toEqual(undefined);
  });

  it('Right', () => {
    const right = Either.Right(42);
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


  describe('record', () => {
    it('gets right from a record of rights', () => {
      expect(Either.record({
        first: Right(1),
        second: Right(2),
        third: Right(3)
      }).base).toEqual({
        tag: 'right',
        value: {
          first: 1,
          second: 2,
          third: 3
        }
      });
    });

    it('gets left from a record with single left', () => {
      expect(Either.record({
        first: Right(1),
        second: Left('error'),
        third: Right(3)
      }).base).toEqual({
        tag: 'left',
        value: 'error'
      });
    });

    it ('gets the value from the first left', () => {
      expect(Either.record({
        first:  Left('first'),
        second: Left('second'),
        third: Left('third')
      }).base).toEqual({
        tag: 'left',
        value: 'first'
      });
    });
  });


  describe('all', () => {
    it('gets right from array of rights', () => {
      expect(Either.all([Right(1), Right(2), Right(3)]).base).toEqual({
        tag: 'right', value: [1, 2, 3]
      });
    });

    it('gets left from array with single left', () => {
      expect(Either.all([Right(1), Left('error'), Right(3)]).base).toEqual({
        tag: 'left', value: 'error'
      });
    });

    it('gets first left from array with multiple lefts', () => {
      expect(Either.all([Left('first'), Left('second'), Left('third')]).base).toEqual({
        tag: 'left', value: 'first'
      });
    });

    it('gets right from empty array', () => {
      expect(Either.all([]).base).toEqual({
        tag: 'right', value: []
      });
    });

    it('test typings', () => {
      const [num, bool, str] = Either.all([
        Right(42), Right(true), Right('str')
      ]).getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });


  describe('array', () => {
    it('gets right from array of rights', () => {
      expect(Either.array([Right(1), Right(2), Right(3)]).base).toEqual({
        tag: 'right', value: [1, 2, 3]
      });
    });

    it('gets left from array with single left', () => {
      expect(Either.array([Right(1), Left('error'), Right(3)]).base).toEqual({
        tag: 'left', value: 'error'
      });
    });

    it('gets first left from array with multiple lefts', () => {
      expect(Either.array([Left('first'), Left('second'), Left('third')]).base).toEqual({
        tag: 'left', value: 'first'
      });
    });

    it('gets right from empty array', () => {
      expect(Either.array([]).base).toEqual({
        tag: 'right', value: []
      });
    });

    it('test typings', () => {
      const [num, bool, str] = Either.array([
        Right(42), Right(true), Right('str')
      ]).getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
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


  describe('applyAll', () => {
    it ('applies function to array of rights', () => {
      const applied = Either.applyAll((a, b) => a + b, [Right(42), Right(69)]);
      expect(applied.base).toEqual({tag: 'right', value: 111});
    });

    it ('applies function to array with one left', () => {
      const applied = Either.applyAll((a, b) => a + b, [Right(42), Left('error')]);
      expect(applied.base).toEqual({tag: 'left', value: 'error' });
    });

    it ('test typings', () => {
      const applied = Either.applyAll(
        (a: number, b: boolean, c: string) => [a,b,c] as const,
        [Right(42), Right(true), Right('str')]);
      const [num, bool, str] = applied.getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });


  describe('apply', () => {
    it('right function applies to right value', () => {
      const applied = Right((str: string) => parseInt(str, 10)).apply(Right('42'));
      expect(applied.base).toEqual({ tag: 'right', value: 42 });
    });

    it('right function applies to left', () => {
      const applied = Right((str: string) => parseInt(str, 10)).apply(Left<string, string>('error'));
      expect(applied.base).toEqual({ tag: 'left', value: 'error' });
    });

    it ('cannot apply right not containing a function', () => {
      const applied = Right(0)
        /* @ts-expect-error testing */
        .apply(Right(42));
      expect(applied.base).toEqual({tag: 'right', value: 42 });
    });

    it('cannot apply left to right value', () => {
      const applied = Left('error')
      /* @ts-expect-error testing */
        .apply(Right(42));
      expect(applied.base).toEqual({ tag: 'left', value: 'error' });
    });

    it('left value applies to left', () => {
      const applied = Left('error').apply(Left('apply'));
      expect(applied.base).toEqual({ tag: 'left', value: 'error' });
    });

    it('applies a curried function multiple times to right values', () => {
      const applied = Right((a: number) => (b: number) => (c: number) => a + b * c)
        .apply(Right(1))
        .apply(Right(2))
        .apply(Right(3));
      expect(applied.base).toEqual({ tag: 'right', value: 7 });
    });

    it('applies a curried function multiple times to right and left values', () => {
      const applied = Right((a: number) => (b: number) => (c: number) => a + b + c)
        .apply(Right(1))
        .apply(Left('error'))
        .apply(Right(3));
      expect(applied.base).toEqual({ tag: 'left', value: 'error' });
    });

    it('autocurries function', () => {
      const applied = Right((a: number, b: number, c: number) => a + b * c)
        .apply(Right(1))
        .apply(Right(2))
        .apply(Right(3));
      expect(applied.base).toEqual({ tag: 'right', value: 7 });
    });
  });


  describe('some', () => {
    it('gets first left from array with lefts', () => {
      expect(
        Either.some([Left('first'), Left('second'), Left('third')]).base
      ).toEqual({ tag: 'left', value: 'first'});
    });

    it('gets right from array with single right', () => {
      expect(
        Either.some([Left('first'), Right(2), Left('third')]).base
      ).toEqual({ tag: 'right', value: 2 });
    });

    it('gets first right from array with multiple rights', () => {
      expect(
        Either.some([Right(1), Right(2), Right(3)]).base
      ).toEqual({ tag: 'right', value: 1 });
    });
  });

  describe('values', () => {
    it('gets values from array with rights', () => {
      expect(
        Either.values([Right(1), Right(2), Right(3)])
      ).toEqual([1,2,3]);
    });

    it('gets oks from array with error', () => {
      expect(
        Either.values([Right(1), Left('error'), Right(3)])
      ).toEqual([1, 3]);
    });

    it('gets empty array from empty array', () => {
      expect(
        Either.values([])
      ).toEqual([]);
    });
  });

  describe('default', () => {
    it('right defaults to itself', () => {
      const def = Right(42).default(0);
      expect(def.base).toEqual({ tag: 'right', value: 42 });
    });

    it('left defaults to default', () => {
      const def = Left('error').default(0);
      expect(def.base).toEqual({ tag: 'right', value: 0 });
    });

    it('left defaults to first default', () => {
      const def = Left('error').default(0).default(-1);
      expect(def.base).toEqual({ tag: 'right', value: 0 });
    });
  });


  describe('or', () => {
    it('right or right returns right', () => {
      const or = Right(42).or(Right(0));
      expect(or.base).toEqual({ tag: 'right', value: 42 });
    });

    it('right or left returns right', () => {
      const or = Right(42).or(Left('error'));
      expect(or.base).toEqual({ tag: 'right', value: 42 });
    });

    it('left or right returns right', () => {
      const or = Left('error').or(Right(42));
      expect(or.base).toEqual({ tag: 'right', value: 42 });
    });

    it('left or left returns left', () => {
      const or = Left('first').or(Left('second'));
      expect(or.base).toEqual({ tag: 'left', value: 'first' });
    });
  });

  describe('orElse', () => {
    it('right orElse right returns right', () => {
      const or = Right(42).orElse(Right(0));
      expect(or.base).toEqual({ tag: 'right', value: 0 });
    });

    it('right orElse left returns right', () => {
      const or = Right(42).orElse(Left('error'));
      expect(or.base).toEqual({ tag: 'right', value: 42 });
    });

    it('left orElse right returns right', () => {
      const or = Left('error').orElse(Right(42));
      expect(or.base).toEqual({ tag: 'right', value: 42 });
    });

    it('left orElse left returns left', () => {
      const or = Left('first').orElse(Left('second'));
      expect(or.base).toEqual({ tag: 'left', value: 'second' });
    });
  });
});