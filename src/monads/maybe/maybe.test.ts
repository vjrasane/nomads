import { applyTo, fromNullable, fromNumber, fromOptional, join, Just, Nothing } from './maybe';

describe('Maybe', () => {
  it('Nothing', () => {
    expect(Nothing.tag).toBe('nothing');
    expect(Nothing.get()).toBe(undefined);
  });

  it('Just', () => {
    expect(Just(42).tag).toBe('just');
    expect(Just(42).get()).toBe(42);
  });

  describe('map', () => {
    it('maps just value', () => {
      const mapped = Just('42').map((str) => parseInt(str, 10));
      expect(mapped.tag).toBe('just');
      expect(mapped.get()).toBe(42);
    });

    it('maps nothing value', () => {
      const mapped = Nothing.map((str) => parseInt(str, 10));
      expect(mapped.tag).toBe('nothing');
      expect(mapped.get()).toEqual(undefined);
    });
  });

  describe('chain', () => {
    it('chains two just values', () => {
      const chained = Just('42').chain((str) => Just(parseInt(str, 10)));
      expect(chained.tag).toBe('just');
      expect(chained.get()).toBe(42);
    });

    it('chains two nothing values', () => {
      const chained = Nothing.chain(() => Nothing);
      expect(chained.tag).toBe('nothing');
      expect(chained.get()).toEqual(undefined);
    });

    it('chains nothing value with just value', () => {
      const chained = Nothing.chain(() => Just(42));
      expect(chained.tag).toBe('nothing');
      expect(chained.get()).toEqual(undefined);
    });

    it('chains just value with nothing value', () => {
      const chained = Just(42).chain(() => Nothing);
      expect(chained.tag).toBe('nothing');
      expect(chained.get()).toEqual(undefined);
    });
  });

  describe('default', () => {
    it('just defaults to original value', () => {
      expect(Just(42).default(0).get()).toBe(42);
    });
    
    it('nothing defaults to given value', () => {
      expect(Nothing.default(42).get()).toBe(42);
    });

    it('nothing defaults to first default value', () => {
      expect(Nothing.default(42).default(0).get()).toBe(42);
    });
  });

  describe('applyTo', () => {
    it('just function applies to just value', () => {
      const applied =  Just(
        (str: string) => parseInt(str, 10)
      ).chain(applyTo(Just('42')));
      expect(applied.tag).toBe('just');
      expect(applied.get()).toBe(42);
    });
    
    it('just function applies to nothing', () => {
      const applied =  Just(
        (str: string) => parseInt(str, 10)
      ).chain(applyTo(Nothing));
      expect(applied.tag).toBe('nothing');
      expect(applied.get()).toEqual(undefined);
    });

    it('nothing applies to just value', () => {
      const applied =  Nothing.chain(applyTo(Just('42')));
      expect(applied.tag).toBe('nothing');
      expect(applied.get()).toEqual(undefined);
    });

    it('nothing value applies to nothing', () => {
      const applied = Nothing.chain(applyTo(Nothing));
      expect(applied.tag).toBe('nothing');
      expect(applied.get()).toEqual(undefined);
    });

    it('applies a curried function multiple times to just values', () => {
      const applied =  Just(
        (a: number) => (b: number) => (c: number) => a + b + c
      )
        .chain(applyTo(Just(1)))
        .chain(applyTo(Just(2)))
        .chain(applyTo(Just(3)));
      expect(applied.tag).toBe('just');
      expect(applied.get()).toEqual(6);
    });

    it('applies a curried function multiple times to just and nothing values', () => {
      const applied =  Just(
        (a: number) => (b: number) => (c: number) => a + b + c
      )
        .chain(applyTo(Just(1)))
        .chain(applyTo(Nothing))
        .chain(applyTo(Just(3)));
      expect(applied.tag).toBe('nothing');
      expect(applied.get()).toEqual(undefined);
    });
  });

  describe('filter', () => {
    it('filters just value with true condition', () => {
      const filtered = Just(42).filter((n) => n > 0);
      expect(filtered.tag).toBe('just');
      expect(filtered.get()).toBe(42);
    });

    it('filters just value with false condition', () => {
      const filtered = Just(42).filter((n) => n < 0);
      expect(filtered.tag).toBe('nothing');
      expect(filtered.get()).toBe(undefined);
    });

    it('filters nothing with condition', () => {
      const filtered = Nothing.filter((n) => n < 0);
      expect(filtered.tag).toBe('nothing');
      expect(filtered.get()).toBe(undefined);
    });
  });

  describe('fromOptional', () => {
    it('gets just from value', () => {
      const maybe = fromOptional(42);
      expect(maybe.tag).toEqual('just');
      expect(maybe.get()).toEqual(42);
    });

    it('gets nothing from undefined', () => {
      const maybe = fromOptional(undefined);
      expect(maybe.tag).toEqual('nothing');
    });

    it('gets just from null', () => {
      const maybe = fromOptional(null);
      expect(maybe.tag).toEqual('just');
      expect(maybe.get()).toEqual(null);
    });
  });

  describe('fromNullable', () => {
    it('gets just from value', () => {
      const maybe = fromNullable(42);
      expect(maybe.tag).toEqual('just');
      expect(maybe.get()).toEqual(42);
    });

    it('gets nothing from undefined', () => {
      const maybe = fromNullable(undefined);
      expect(maybe.tag).toEqual('nothing');
      expect(maybe.get()).toEqual(undefined);
    });

    it('gets nothing from null', () => {
      const maybe = fromNullable(null);
      expect(maybe.tag).toEqual('nothing');
      expect(maybe.get()).toEqual(undefined);
    });
  });

  describe('fromNumber', () => {
    it('gets just from number', () => {
      const maybe = fromNumber(42);
      expect(maybe.tag).toEqual('just');
      expect(maybe.get()).toEqual(42);
    });

    it('gets nothing from NaN', () => {
      const maybe = fromNumber(NaN);
      expect(maybe.tag).toEqual('nothing');
      expect(maybe.get()).toEqual(undefined);
    });
  });

  describe('join', () => {
    it('joins nested just values', () => {
      const joined = join(Just(Just(42)));
      expect(joined.tag).toBe('just');
      expect(joined.get()).toBe(42);
    });

    it('joins nothing value', () => {
      const joined = join(Nothing);
      expect(joined.tag).toBe('nothing');
      expect(joined.get()).toBe(undefined);
    });

    it('joins nested nothing value', () => {
      const joined = join(Just(Nothing));
      expect(joined.tag).toBe('nothing');
      expect(joined.get()).toBe(undefined);
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
      expect(Just('42').fold(
        (str) => parseInt(str, 10),
        () => 69
      )).toBe(42);
    });

    it('folds nothing value', () => {  
      expect(Nothing.fold(
        (str) => parseInt(str, 10),
        () => 69
      )).toBe(69);
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
    it ('gets ok from just value', () => {
      const res = Just(42).toResult(undefined);
      expect(res.tag).toBe('ok');
      expect(res.get()).toBe(42);
    });

    it ('gets err from nothing value', () => {
      const res = Nothing.toResult('no value');
      expect(res.tag).toBe('err');
      expect(res.get()).toBe(undefined);
      expect(res.getError().get()).toBe('no value');
    });
  });
});