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

  describe('applyTo', () => {
    it('just function applies to just value', () => {
      const applied = Just((n: number) => n * 2).chain(Maybe.applyTo(Just(42)));
      expect(applied.maybe).toEqual({ tag: 'just', value: 84 });
    });

    it('just function applies to nothing', () => {
      const applied = Just((n: number) => n * 2).chain(Maybe.applyTo(Nothing));
      expect(applied.maybe).toEqual({ tag: 'nothing' });
    });

    it('nothing applies to just value', () => {
      const applied = Nothing.chain(Maybe.applyTo(Just(42)));
      expect(applied.maybe).toEqual({ tag: 'nothing' });
    });

    it('nothing value applies to nothing', () => {
      const applied = Nothing.chain(Maybe.applyTo(Nothing));
      expect(applied.maybe).toEqual({ tag: 'nothing' });
    });

    it('applies a curried function multiple times to just values', () => {
      const applied = Just((a: number) => (b: number) => (c: number) => a + b + c)
        .chain(Maybe.applyTo(Just(1)))
        .chain(Maybe.applyTo(Just(2)))
        .chain(Maybe.applyTo(Just(3)));
      expect(applied.maybe).toEqual({ tag: 'just', value: 6 });
    });

    it('applies a curried function multiple times to just and nothing values', () => {
      const applied = Just((a: number) => (b: number) => (c: number) => a + b + c)
        .chain(Maybe.applyTo(Just(1)))
        .chain(Maybe.applyTo(Nothing))
        .chain(Maybe.applyTo(Just(3)));
      expect(applied.maybe).toEqual({ tag: 'nothing' });
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
        Just(42).fold(
          () => 69,
          (n) => n * 2
        )
      ).toBe(84);
    });

    it('folds nothing value', () => {
      expect(
        Nothing.fold(
          () => 69,
          (n) => n * 2
        )
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

  describe('wrap', () => {
    it('wraps just value', () => {
      expect(Maybe.from({ tag: 'just', value: 42 }).maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('wraps nothing value', () => {
      expect(Maybe.from({ tag: 'nothing' }).maybe).toEqual({ tag: 'nothing' });
    });
  });
});
