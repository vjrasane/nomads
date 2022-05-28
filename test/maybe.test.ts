import { Maybe, Just, Nothing } from '../maybe';

describe('Maybe', () => {
  it('Nothing', () => {
    expect(Nothing.maybe).toEqual({ tag: 'nothing' });
    expect(Nothing.tag).toBe('nothing');
    expect(Nothing.get()).toBe(undefined);
    expect(Nothing.value).toBe(undefined);
  });

  it('Just', () => {
    expect(Just(42).maybe).toEqual({ tag: 'just', value: 42 });
    expect(Just(42).tag).toBe('just');
    expect(Just(42).get()).toBe(42);
    expect(Just(42).value).toBe(42);
  });

  describe('functor laws', () => {
    it('identity', () => {
      expect(Just(42).map((v) => v).maybe).toEqual(Just(42).maybe);
    });

    it('composition', () => {
      const f = (v: number) => v * 2;
      const g = (v: number) => v + 2;
      expect(Just(42).map(f).map(g).maybe).toEqual(
        Just(42).map((v) => g(f(v))).maybe
      );
    });
  });

  describe('applicative laws', () => {
    it('identity', () => {
      const left = Just((v: number) => v).apply(Just(42));
      const right = Just(42);
      expect(left.maybe).toEqual(right.maybe);
    });

    it('homomorphism', () => {
      const f = (v: number) => v * 2;
      const left = Just(f).apply(Just(42));
      const right = Just(f(42));
      expect(left.maybe).toEqual(right.maybe);
    });

    it('interchange', () => {
      const f = (v: number) => v * 2;
      const left = Just(f).apply(Just(42));
      const right = Just((g: typeof f) => g(42)).apply(Just(f));
      expect(left.maybe).toEqual(right.maybe);
    });

    it('composition', () => {
      const u = Just((b: boolean) => [b]);
      const v = Just((a: number) => a > 0);
      const w = Just(42);
      const compose = (f: (b: boolean) => Array<boolean>) =>
        (g: (a: number) => boolean) =>
          (a: number): Array<boolean> =>
            f(g(a));
      const left = Just(compose)
        .apply(u)
        .apply(v)
        .apply(w);
      const right = u.apply(v.apply(w));
      expect(left.maybe).toEqual(right.maybe);
    });
  });

  describe('monad laws', () => {
    it('left identity', () => {
      const ret = <A>(n: A) => Just(n);
      const f = (n: number) => Just(n * 2);
      const left = ret(42).chain(f);
      const right = f(42);
      expect(left.maybe).toEqual(right.maybe);
    });

    it('right identity', () => {
      const ret = <A>(n: A) => Just(n);
      const left = Just(42).chain(ret);
      const right = Just(42);
      expect(left.maybe).toEqual(right.maybe);
    });

    it('associativity', () => {
      const m = Just(42);
      const f = (n: number) => Just(n + 2);
      const g = (n: number) => Just(n * 2);
      const left = m.chain(f).chain(g);
      const right = m.chain((v) => f(v).chain(g));
      expect(left.maybe).toEqual(right.maybe);
    });
  });

  describe('map', () => {
    it('maps just value', () => {
      const mapped = Just(42).map((n) => n * 2);
      expect(mapped.maybe).toEqual({ tag: 'just', value: 84 });
    });

    it('maps nothing value', () => {
      const mapped = Nothing.map((str) => parseInt(str, 10));
      expect(mapped.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('chain', () => {
    it('chains two just values', () => {
      const chained = Just(42).chain((n) => Just(n * 2));
      expect(chained.maybe).toEqual({ tag: 'just', value: 84 });
    });

    it('chains two nothing values', () => {
      const chained = Nothing.chain(() => Nothing);
      expect(chained.maybe).toEqual({ tag: 'nothing' });
    });

    it('chains nothing value with just value', () => {
      const chained = Nothing.chain(() => Just(42));
      expect(chained.maybe).toEqual({ tag: 'nothing' });
    });

    it('chains just value with nothing value', () => {
      const chained = Just(42).chain(() => Nothing);
      expect(chained.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('or', () => {
    it('just or just returns first value', () => {
      const or = Just(42).or(Just(0));
      expect(or.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('just or nothing returns first value', () => {
      const or = Just(42).or(Nothing);
      expect(or.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('nothing or just returns second value', () => {
      const or = Nothing.or(Just(42));
      expect(or.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('nothing or nothing returns nothing', () => {
      const or = Nothing.or(Nothing);
      expect(or.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('orElse', () => {
    it('just orElse just returns second value', () => {
      const or = Just(42).orElse(Just(0));
      expect(or.maybe).toEqual({ tag: 'just', value: 0 });
    });

    it('just orElse nothing returns first value', () => {
      const or = Just(42).orElse(Nothing);
      expect(or.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('nothing orElse just returns second value', () => {
      const or = Nothing.orElse(Just(42));
      expect(or.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('nothing orElse nothing returns nothing', () => {
      const or = Nothing.orElse(Nothing);
      expect(or.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('default', () => {
    it('just defaults to original value', () => {
      const def = Just(42).default(0);
      expect(def.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('nothing defaults to given value', () => {
      const def = Nothing.default(0);
      expect(def.maybe).toEqual({ tag: 'just', value: 0 });
    });

    it('nothing defaults to first default value', () => {
      const def = Nothing.default(0).default(-1);
      expect(def.maybe).toEqual({ tag: 'just', value: 0 });
    });
  });

  describe('filter', () => {
    it('filters just value with true condition', () => {
      const filtered = Just(42).filter((n) => n > 0);
      expect(filtered.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('filters just value with false condition', () => {
      const filtered = Just(42).filter((n) => n < 0);
      expect(filtered.maybe).toEqual({ tag: 'nothing' });
    });

    it('filters nothing with condition', () => {
      const filtered = Nothing.filter((n) => n < 0);
      expect(filtered.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('fromOptional', () => {
    it('gets just from value', () => {
      const maybe = Maybe.fromOptional(42);
      expect(maybe.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('gets nothing from undefined', () => {
      const maybe = Maybe.fromOptional(undefined);
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets just from null', () => {
      const maybe = Maybe.fromOptional(null);
      expect(maybe.maybe).toEqual({ tag: 'just', value: null });
    });
  });

  describe('fromNullable', () => {
    it('gets just from value', () => {
      const maybe = Maybe.fromNullable(42);
      expect(maybe.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('gets nothing from undefined', () => {
      const maybe = Maybe.fromNullable(undefined);
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from null', () => {
      const maybe = Maybe.fromNullable(null);
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('fromNumber', () => {
    it('gets just from number', () => {
      const maybe = Maybe.fromNumber(42);
      expect(maybe.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('gets nothing from NaN', () => {
      const maybe = Maybe.fromNumber(NaN);
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('join', () => {
    it('joins nested just values', () => {
      const joined = Maybe.join(Just(Just(42)));
      expect(joined.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('joins nothing value', () => {
      const joined = Maybe.join(Nothing);
      expect(joined.maybe).toEqual({ tag: 'nothing' });
    });

    it('joins nested nothing value', () => {
      const joined = Maybe.join(Just(Nothing));
      expect(joined.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('toString', () => {
    it('prints just value', () => {
      expect(Just(42).toString()).toBe('Just(42)');
    });

    it('prints nested values', () => {
      expect(Just(Just(Nothing)).toString()).toBe('Just(Just(Nothing))');
    });

    it('prints nothing value', () => {
      expect(Nothing.toString()).toBe('Nothing');
    });
  });

  describe('fold', () => {
    it('folds just value', () => {
      expect(
        Just(42).fold({
          nothing: () => 69,
          just: (n) => n * 2,
        })
      ).toBe(84);
    });

    it('folds nothing value', () => {
      expect(
        Nothing.fold({
          nothing: () => 69,
          just: (n) => n * 2,
        })
      ).toBe(69);
    });
  });

  describe('getOrElse', () => {
    it('gets just value', () => {
      expect(Just(42).getOrElse(0)).toBe(42);
    });

    it('gets nothing value', () => {
      expect(Nothing.getOrElse(42)).toBe(42);
    });

    it('gets nothing default value', () => {
      expect(Nothing.default(42).getOrElse(0)).toBe(42);
    });
  });

  describe('toResult', () => {
    it('gets ok from just value', () => {
      const res = Just(42).toResult('error');
      expect(res.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('gets err from nothing value', () => {
      const res = Nothing.toResult('error');
      expect(res.result).toEqual({ tag: 'err', error: 'error' });
    });
  });

  describe('nth', () => {
    it('gets just value from array', () => {
      expect(Maybe.nth(1, [1, 2, 3]).maybe).toEqual({ tag: 'just', value: 2 });
    });

    it('gets nothing value from empty array', () => {
      expect(Maybe.nth(1, []).maybe).toEqual({ tag: 'nothing' });
    });

    it('gets nothing value from undefined value', () => {
      const maybe = Maybe.nth(1, [undefined, undefined]);
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets just value from null value', () => {
      const maybe = Maybe.nth(1, [null, null]);
      expect(maybe.maybe).toEqual({ tag: 'just', value: null });
    });
  });

  describe('first', () => {
    it('gets first value from array', () => {
      expect(Maybe.first([1, 2, 3]).maybe).toEqual({ tag: 'just', value: 1 });
    });

    it('gets nothing value from empty array', () => {
      expect(Maybe.first([]).maybe).toEqual({ tag: 'nothing' });
    });

    it('gets nothing value from undefined value', () => {
      const maybe = Maybe.first([undefined, undefined]);
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets just value from null value', () => {
      const maybe = Maybe.first([null, null]);
      expect(maybe.maybe).toEqual({ tag: 'just', value: null });
    });
  });

  describe('last', () => {
    it('gets last value from array', () => {
      expect(Maybe.last([1, 2, 3]).maybe).toEqual({ tag: 'just', value: 3 });
    });

    it('gets nothing value from empty array', () => {
      expect(Maybe.last([]).maybe).toEqual({ tag: 'nothing' });
    });

    it('gets nothing value from undefined value', () => {
      const maybe = Maybe.last([undefined, undefined]);
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets just value from null value', () => {
      const maybe = Maybe.last([null, null]);
      expect(maybe.maybe).toEqual({ tag: 'just', value: null });
    });
  });

  describe('unwrap', () => {
    it('switch case for just', () => {
      const unwrapped = Just(42).maybe;
      switch (unwrapped.tag) {
      case 'just': {
        expect(unwrapped.value).toBe(42);
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });

    it('switch case for nothing', () => {
      const unwrapped = Nothing.maybe;
      switch (unwrapped.tag) {
      case 'nothing': {
        expect(true).toBe(true);
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });
  });

  describe('record', () => {
    it('gets just from a record of justs', () => {
      expect(
        Maybe.record({
          first: Just(1),
          second: Just(2),
          third: Just(3),
        }).maybe
      ).toEqual({
        tag: 'just',
        value: {
          first: 1,
          second: 2,
          third: 3,
        },
      });
    });

    it('gets nothing from a record with single nothing', () => {
      expect(
        Maybe.record({
          first: Just(1),
          second: Nothing,
          third: Just(3),
        }).maybe
      ).toEqual({
        tag: 'nothing',
      });
    });
  });

  describe('all', () => {
    it('returns just for an array of justs', () => {
      expect(Maybe.all([Just(1), Just(2), Just(3)]).maybe).toEqual({
        tag: 'just',
        value: [1, 2, 3],
      });
    });

    it('returns nothing for an array with a single nothing', () => {
      expect(Maybe.all([Just(1), Nothing, Just(3)]).maybe).toEqual({
        tag: 'nothing',
      });
    });

    it('returns just of empty array for an empty array', () => {
      expect(Maybe.all([]).maybe).toEqual({ tag: 'just', value: [] });
    });

    it('test typing', () => {
      const [num, bool, string] = Maybe.all([
        Just(42),
        Just(true),
        Just('str'),
      ]).getOrElse([0, false, '']);
      expect([num, bool, string]).toEqual([42, true, 'str']);
    });
  });

  describe('array', () => {
    it('returns just for an array of justs', () => {
      expect(Maybe.array([Just(1), Just(2), Just(3)]).maybe).toEqual({
        tag: 'just',
        value: [1, 2, 3],
      });
    });

    it('returns nothing for an array with a single nothing', () => {
      expect(Maybe.array([Just(1), Nothing, Just(3)]).maybe).toEqual({
        tag: 'nothing',
      });
    });

    it('returns just of empty array for an empty array', () => {
      expect(Maybe.array([]).maybe).toEqual({ tag: 'just', value: [] });
    });

    it('test typing', () => {
      const [num, bool, string] = Maybe.array([
        Just(42),
        Just(true),
        Just('str'),
      ]).getOrElse([0, false, '']);
      expect([num, bool, string]).toEqual([42, true, 'str']);
    });
  });

  describe('some', () => {
    it('returns just for an array of justs', () => {
      expect(Maybe.some([Just(1), Just(2), Just(3)]).maybe).toEqual({
        tag: 'just',
        value: 1,
      });
    });

    it('returns nothing for an array of nothings', () => {
      expect(Maybe.some([Nothing, Nothing, Nothing]).maybe).toEqual({
        tag: 'nothing',
      });
    });

    it('returns just for an array with single just', () => {
      expect(Maybe.some([Nothing, Just(2), Nothing]).maybe).toEqual({
        tag: 'just',
        value: 2,
      });
    });

    it('returns nothing for an empty array', () => {
      expect(Maybe.some([]).maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('values', () => {
    it('returns values for an array of justs', () => {
      expect(Maybe.values([Just(1), Just(2), Just(3)])).toEqual([1, 2, 3]);
    });

    it('returns values for an array of with single nothing', () => {
      expect(Maybe.values([Just(1), Nothing, Just(3)])).toEqual([1, 3]);
    });

    it('returns empty array for an array of nothings', () => {
      expect(Maybe.values([Nothing, Nothing, Nothing])).toEqual([]);
    });

    it('returns empty array for an empty array', () => {
      expect(Maybe.values([])).toEqual([]);
    });
  });

  describe('parseInt', () => {
    it('empty string returns nothing', () => {
      expect(Maybe.parseInt('').maybe).toEqual({ tag: 'nothing' });
    });

    it('arbitrary string returns nothing', () => {
      expect(Maybe.parseInt('not really a number').maybe).toEqual({
        tag: 'nothing',
      });
    });

    it('positive integer string returns just', () => {
      expect(Maybe.parseInt('42').maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('negative integer string returns just', () => {
      expect(Maybe.parseInt('-42').maybe).toEqual({ tag: 'just', value: -42 });
    });

    it('positive float string returns just integer', () => {
      expect(Maybe.parseInt('4.2').maybe).toEqual({ tag: 'just', value: 4 });
    });

    it('negative float string returns just integer', () => {
      expect(Maybe.parseInt('-4.2').maybe).toEqual({ tag: 'just', value: -4 });
    });

    it('number with trailing arbitraty string returns nothing', () => {
      expect(Maybe.parseInt('42notstring').maybe).toEqual({ tag: 'nothing' });
    });

    it('float string with no leading zero return just zero', () => {
      expect(Maybe.parseInt('.42').maybe).toEqual({ tag: 'just', value: 0 });
    });
  });

  describe('parseFloat', () => {
    it('empty string returns nothing', () => {
      expect(Maybe.parseFloat('').maybe).toEqual({ tag: 'nothing' });
    });

    it('arbitrary string returns nothing', () => {
      expect(Maybe.parseFloat('not really a number').maybe).toEqual({
        tag: 'nothing',
      });
    });

    it('positive integer string returns just', () => {
      expect(Maybe.parseFloat('42').maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('negative integer string returns just', () => {
      expect(Maybe.parseFloat('-42').maybe).toEqual({
        tag: 'just',
        value: -42,
      });
    });

    it('positive float string returns just', () => {
      expect(Maybe.parseFloat('4.2').maybe).toEqual({
        tag: 'just',
        value: 4.2,
      });
    });

    it('negative float string returns just', () => {
      expect(Maybe.parseFloat('-4.2').maybe).toEqual({
        tag: 'just',
        value: -4.2,
      });
    });

    it('number with trailing arbitraty string returns nothing', () => {
      expect(Maybe.parseFloat('42notstring').maybe).toEqual({ tag: 'nothing' });
    });

    it('float string with no leading zero return just', () => {
      expect(Maybe.parseFloat('.42').maybe).toEqual({
        tag: 'just',
        value: 0.42,
      });
    });
  });

  describe('find', () => {
    it('finds matching value', () => {
      expect(Maybe.find((n) => n === 2, [1, 2, 3]).maybe).toEqual({
        tag: 'just',
        value: 2,
      });
    });

    it('returns nothing for no matches', () => {
      expect(Maybe.find((n) => n === -1, [1, 2, 3]).maybe).toEqual({
        tag: 'nothing',
      });
    });

    it('returns nothing for empty array', () => {
      expect(Maybe.find((n) => n === 2, []).maybe).toEqual({
        tag: 'nothing',
      });
    });
  });

  describe('concatTo', () => {
    it('concats just value', () => {
      expect(Just(42).concatTo([1, 2, 3])).toEqual([42, 1, 2, 3]);
    });

    it('concats nothing value', () => {
      expect(Nothing.concatTo([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('appendTo', () => {
    it('appends just value', () => {
      expect(Just(42).appendTo([1, 2, 3])).toEqual([1, 2, 3, 42]);
    });

    it('appends nothing value', () => {
      expect(Nothing.appendTo([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('apply', () => {
    it('applies function to just value', () => {
      const applied = Just((n: number) => n * 2).apply(Just(42));
      expect(applied.maybe).toEqual({ tag: 'just', value: 84 });
    });

    it('applies function to nothing', () => {
      const applied = Just((n: number) => n * 2).apply(Nothing);
      expect(applied.maybe).toEqual({ tag: 'nothing' });
    });

    it('cannot apply nothing to just', () => {
      const applied = Nothing
        /* @ts-expect-error testing */
        .apply(Just(42));
      expect(applied.maybe).toEqual({ tag: 'nothing' });
    });

    it('cannot apply maybe not containing a function', () => {
      const applied = Just(0)
        /* @ts-expect-error testing */
        .apply(Just(42));
      expect(applied.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('applies nothing to nothing', () => {
      const applied = Nothing.apply(Nothing);
      expect(applied.maybe).toEqual({ tag: 'nothing' });
    });

    it('applies a curried function multiple times to just values', () => {
      const applied = Just(
        (a: number) => (b: number) => (c: number) => a + b * c
      )
        .apply(Just(1))
        .apply(Just(2))
        .apply(Just(3));
      expect(applied.maybe).toEqual({ tag: 'just', value: 7 });
    });

    it('applies a curried function multiple times to just and nothing values', () => {
      const applied = Just(
        (a: number) => (b: number) => (c: number) => a + b + c
      )
        .apply(Just(1))
        .apply(Nothing)
        .apply(Just(3));
      expect(applied.maybe).toEqual({ tag: 'nothing' });
    });

    it('autocurries function', () => {
      const applied = Just((a: number, b: number, c: number) => a + b * c)
        .apply(Just(1))
        .apply(Just(2))
        .apply(Just(3));
      expect(applied.maybe).toEqual({ tag: 'just', value: 7 });
    });
  });

  describe('applyAll', () => {
    it('applies function to array of justs', () => {
      const applied = Maybe.applyAll((a, b) => a + b, [Just(42), Just(69)]);
      expect(applied.maybe).toEqual({ tag: 'just', value: 111 });
    });

    it('applies function to array with one nothing', () => {
      const applied = Maybe.applyAll((a, b) => a + b, [Just(42), Nothing]);
      expect(applied.maybe).toEqual({ tag: 'nothing' });
    });

    it('test typings', () => {
      const applied = Maybe.applyAll(
        (a: number, b: boolean, c: string) => [a, b, c] as const,
        [Just(42), Just(true), Just('str')]
      );
      const [num, bool, str] = applied.getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });
});
