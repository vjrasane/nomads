import { applyTo, Err, fromNullable, fromNumber, fromOptional, join, Ok } from '../src/monads/result';

describe('Result', () => {
  it('Ok', () => {
    expect(Ok(42).tag).toBe('ok');
    expect(Ok(42).get()).toBe(42);
  });

  it('Err', () => {
    expect(Err('err').tag).toBe('err');
    expect(Err('err').get()).toEqual(undefined);
    expect(Err('err').getError().get()).toBe('err');
  });

  describe('map', () => {
    it ('maps ok value', () => {
      const mapped = Ok(42).map((num) => num * 2);
      expect(mapped.tag).toBe('ok');
      expect(mapped.get()).toBe(84);
    });

    it ('maps err value', () => {
      const mapped = Err('error').map((num) => num * 2);
      expect(mapped.tag).toBe('err');
      expect(mapped.get()).toEqual(undefined);
      expect(mapped.getError().get()).toBe('error');
    });
  });

  describe('chain', () => {
    it ('chains ok value', () => {
      const chained = Ok(42).chain((num) => Ok(num * 2));
      expect(chained.tag).toBe('ok');
      expect(chained.get()).toBe(84);
    });

    it ('chains err value', () => {
      const chained = Err('error').chain((num) => Ok(num * 2));
      expect(chained.tag).toBe('err');
      expect(chained.get()).toEqual(undefined);
      expect(chained.getError().get()).toBe('error');
    });
  });

  describe('fold', () => {
    it ('folds ok value', () => {
      const folded = Ok(42).fold(
        () => 69,
        (num) => num / 2
      );
      expect(folded).toBe(21);
    });

    it ('folds err value', () => {
      const folded = Err('error').fold(
        (err) => err.toUpperCase(),
        () => 69,
      );
      expect(folded).toBe('ERROR');
    });
  });

  describe('toEither', () => {
    it ('gets right from ok value', () => {
      const either = Ok(42).toEither();
      expect(either.tag).toBe('right');
      expect(either.getRight().get()).toBe(42);
    });

    it ('gets left from err value', () => {
      const either = Err('error').toEither();
      expect(either.tag).toBe('left');
      expect(either.getLeft().get()).toBe('error');
    });
  });

  describe('toMaybe', () => {
    it ('gets just from ok value', () => {
      const maybe = Ok(42).toMaybe();
      expect(maybe.tag).toBe('just');
      expect(maybe.get()).toBe(42);
    });

    it ('gets nothing from err value', () => {
      const maybe = Err('error').toMaybe();
      expect(maybe.tag).toBe('nothing');
      expect(maybe.get()).toBe(undefined);
    });
  });

  describe('getValue', () => {
    it ('gets just from ok value', () => {
      const maybe = Ok(42).getValue();
      expect(maybe.tag).toBe('just');
      expect(maybe.get()).toBe(42);
    });

    it ('gets nothing from err value', () => {
      const maybe = Err('error').getValue();
      expect(maybe.tag).toBe('nothing');
      expect(maybe.get()).toBe(undefined);
    });
  });

  describe('getError', () => {
    it ('gets nothing from ok value', () => {
      const maybe = Ok(42).getError();
      expect(maybe.tag).toBe('nothing');
      expect(maybe.get()).toBe(undefined);
    });

    it ('gets just from err value', () => {
      const maybe = Err('error').getError();
      expect(maybe.tag).toBe('just');
      expect(maybe.get()).toBe('error');
    });
  });

  describe('toString', () => {
    it ('prints ok value', () => {
      expect(Ok(42).toString()).toBe('Ok(42)');
    });

    it ('prints err value', () => {
      expect(Err('error').toString()).toBe('Err(error)');
    });
  });

  describe('applyTo', () => {
    it('ok function applies to ok value', () => {
      const applied =  Ok(
        (str: string) => parseInt(str, 10)
      ).chain(applyTo(Ok('42')));
      expect(applied.tag).toBe('ok');
      expect(applied.get()).toBe(42);
    });

    it('ok function applies to err', () => {
      const applied =  Ok(
        (str: string) => parseInt(str, 10)
      ).chain(applyTo(Err('error')));
      expect(applied.tag).toBe('err');
      expect(applied.get()).toEqual(undefined);
      expect(applied.getError().get()).toEqual('error');
    });

    it('err applies to ok value', () => {
      const applied =  Err('error').chain(applyTo(Ok('42')));
      expect(applied.tag).toBe('err');
      expect(applied.get()).toEqual(undefined);
      expect(applied.getError().get()).toEqual('error');
    });

    it('erro value applies to err', () => {
      const applied = Err('error').chain(applyTo(Err('apply')));
      expect(applied.tag).toBe('err');
      expect(applied.get()).toEqual(undefined);
      expect(applied.getError().get()).toEqual('error');
    });

    it('applies a curried function multiple times to ok values', () => {
      const applied =  Ok(
        (a: number) => (b: number) => (c: number) => a + b + c
      )
        .chain(applyTo(Ok(1)))
        .chain(applyTo(Ok(2)))
        .chain(applyTo(Ok(3)));
      expect(applied.tag).toBe('ok');
      expect(applied.get()).toEqual(6);
    });

    it('applies a curried function multiple times to ok and err values', () => {
      const applied =  Ok(
        (a: number) => (b: number) => (c: number) => a + b + c
      )
        .chain(applyTo(Ok(1)))
        .chain(applyTo(Err('error')))
        .chain(applyTo(Ok(3)));
      expect(applied.tag).toBe('err');
      expect(applied.get()).toEqual(undefined);
      expect(applied.getError().get()).toEqual('error');
    });
  });

  describe('join', () => {
    it('joins nested ok values', () => {
      const joined = join(Ok(Ok(42)));
      expect(joined.tag).toBe('ok');
      expect(joined.get()).toBe(42);
    });

    it('joins nested ok and err values', () => {
      const joined = join(Ok(Err('error')));
      expect(joined.tag).toBe('err');
      expect(joined.get()).toBe(undefined);
      expect(joined.getError().get()).toBe('error');
    });

    it('joins nested err value', () => {
      const joined = join(Err('error'));
      expect(joined.tag).toBe('err');
      expect(joined.get()).toBe(undefined);
      expect(joined.getError().get()).toBe('error');
    });
  });

  describe('fromOptional', () => {
    it('gets ok from value', () => {
      const res = fromOptional(42, undefined);
      expect(res.tag).toEqual('ok');
      expect(res.get()).toEqual(42);
    });

    it('gets err from undefined', () => {
      const res = fromOptional(undefined, 'error');
      expect(res.tag).toEqual('err');
      expect(res.get()).toEqual(undefined);
      expect(res.getError().get()).toEqual('error');
    });

    it('gets ok from null', () => {
      const res = fromOptional(null, undefined);
      expect(res.tag).toEqual('ok');
      expect(res.get()).toEqual(null);
    });
  });

  describe('fromNullable', () => {
    it('gets ok from value', () => {
      const res = fromNullable(42, undefined);
      expect(res.tag).toEqual('ok');
      expect(res.get()).toEqual(42);
    });

    it('gets err from undefined', () => {
      const res = fromNullable(undefined, 'error');
      expect(res.tag).toEqual('err');
      expect(res.get()).toEqual(undefined);
      expect(res.getError().get()).toEqual('error');
    });

    it('gets nothing from null', () => {
      const res = fromNullable(null, 'error');
      expect(res.tag).toEqual('err');
      expect(res.get()).toEqual(undefined);
      expect(res.getError().get()).toEqual('error');
    });
  });

  describe('fromNumber', () => {
    it('gets just from number', () => {
      const res = fromNumber(42, undefined);
      expect(res.tag).toEqual('ok');
      expect(res.get()).toEqual(42);
    });

    it('gets nothing from NaN', () => {
      const res = fromNumber(NaN, 'error');
      expect(res.tag).toEqual('err');
      expect(res.get()).toEqual(undefined);
      expect(res.getError().get()).toEqual('error');
    });
  });

});