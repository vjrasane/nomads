import { Maybe } from '../maybe';
import { Result, Err, Ok } from '../result';

describe('Result', () => {
  it('Ok', () => {
    const ok = Ok(42);
    expect(ok.result).toEqual({ tag: 'ok', value: 42 });
    expect(ok.value).toBe(42);
    expect(ok.error).toBe(undefined);
    expect(ok.tag).toBe('ok');
    expect(ok.get()).toBe(42);
    expect(ok.getError().get()).toBe(undefined);
    expect(ok.getValue().get()).toBe(42);
  });

  it('Err', () => {
    const err = Err('error');
    expect(err.result).toEqual({ tag: 'err', error: 'error' });
    expect(err.value).toBe(undefined);
    expect(err.error).toBe('error');
    expect(err.tag).toBe('err');
    expect(err.get()).toBe(undefined);
    expect(err.getError().get()).toBe('error');
    expect(err.getValue().get()).toBe(undefined);
  });

  describe('map', () => {
    it('maps ok value', () => {
      const mapped = Ok(42).map((num) => num * 2);
      expect(mapped.result).toEqual({ tag: 'ok', value: 84 });
    });

    it('maps err value', () => {
      const mapped = Err('error').map((num) => num * 2);
      expect(mapped.result).toEqual({ tag: 'err', error: 'error' });
    });
  });

  describe('mapError', () => {
    it('maps err value', () => {
      const mapped = Err('error').mapError((str) => str.toUpperCase());
      expect(mapped.result).toEqual({ tag: 'err', error: 'ERROR' });
    });

    it('maps ok value', () => {
      const mapped = Ok(42).mapError((str) => str.toUpperCase());
      expect(mapped.result).toEqual({ tag: 'ok', value: 42 });
    });
  });

  describe('chain', () => {
    it('chains ok value', () => {
      const chained = Ok(42).chain((num) => Ok(num * 2));
      expect(chained.result).toEqual({ tag: 'ok', value: 84 });
    });

    it('chains err value', () => {
      const chained = Err('error').chain((num) => Ok(num * 2));
      expect(chained.result).toEqual({ tag: 'err', error: 'error' });
    });
  });

  describe('or', () => {
    it('ok or ok returns ok', () => {
      const or = Ok(42).or(Ok(0));
      expect(or.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('ok or err returns ok', () => {
      const or = Ok(42).or(Err('error'));
      expect(or.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('err or ok returns ok', () => {
      const or = Err('error').or(Ok(42));
      expect(or.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('err or err returns err', () => {
      const or = Err('first').or(Err('second'));
      expect(or.result).toEqual({ tag: 'err', error: 'first' });
    });
  });

  describe('orElse', () => {
    it('ok orElse ok returns ok', () => {
      const or = Ok(42).orElse(Ok(0));
      expect(or.result).toEqual({ tag: 'ok', value: 0 });
    });

    it('ok orElse err returns ok', () => {
      const or = Ok(42).orElse(Err('error'));
      expect(or.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('err orElse ok returns ok', () => {
      const or = Err('error').orElse(Ok(42));
      expect(or.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('err orElse err returns err', () => {
      const or = Err('first').orElse(Err('second'));
      expect(or.result).toEqual({ tag: 'err', error: 'second' });
    });
  });

  describe('default', () => {
    it('ok defaults to itself', () => {
      const def = Ok(42).default(0);
      expect(def.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('err defaults to default', () => {
      const def = Err('error').default(0);
      expect(def.result).toEqual({ tag: 'ok', value: 0 });
    });

    it('err defaults to first default', () => {
      const def = Err('error').default(0).default(-1);
      expect(def.result).toEqual({ tag: 'ok', value: 0 });
    });
  });

  describe('fold', () => {
    it('folds ok value', () => {
      const folded = Ok(42).fold({
        err: () => 69,
        ok: (num) => num / 2
      });
      expect(folded).toBe(21);
    });

    it('folds err value', () => {
      const folded = Err('error').fold({
        err: (err) => err.toUpperCase(),
        ok: () => 'str'
      });
      expect(folded).toBe('ERROR');
    });
  });

  describe('toEither', () => {
    it('gets right from ok value', () => {
      const either = Ok(42).toEither();
      expect(either.tag).toBe('right');
      expect(either.getRight().get()).toBe(42);
    });

    it('gets left from err value', () => {
      const either = Err('error').toEither();
      expect(either.tag).toBe('left');
      expect(either.getLeft().get()).toBe('error');
    });
  });

  describe('toMaybe', () => {
    it('gets just from ok value', () => {
      const maybe = Ok(42).toMaybe();
      expect(maybe.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('gets nothing from err value', () => {
      const maybe = Err('error').toMaybe();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('getOrElse', () => {
    it('gets value from ok', () => {
      expect(Ok(42).getOrElse(0)).toBe(42);
    });

    it('gets value from err', () => {
      expect(Err('error').getOrElse(0)).toBe(0);
    });

    it('gets value from null ok', () => {
      expect(Ok<number | null>(null).getOrElse(0)).toBe(null);
      expect(Ok<number | undefined>(undefined).getOrElse(0)).toBe(undefined);
    });
  });

  describe('getValue', () => {
    it('gets just from ok value', () => {
      const maybe = Ok(42).getValue();
      expect(maybe.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('gets nothing from err value', () => {
      const maybe = Err('error').getValue();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('getError', () => {
    it('gets nothing from ok value', () => {
      const maybe = Ok(42).getError();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets just from err value', () => {
      const maybe = Err('error').getError();
      expect(maybe.maybe).toEqual({ tag: 'just', value: 'error' });
    });
  });

  describe('toString', () => {
    it('prints ok value', () => {
      expect(Ok(42).toString()).toBe('Ok(42)');
    });

    it('prints err value', () => {
      expect(Err('error').toString()).toBe('Err(error)');
    });
  });

  describe('applyTo', () => {
    it('ok function applies to ok value', () => {
      const applied = Ok((str: string) => parseInt(str, 10)).chain(Result.applyTo(Ok('42')));
      expect(applied.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('ok function applies to err', () => {
      const applied = Ok((str: string) => parseInt(str, 10)).chain(Result.applyTo(Err('error')));
      expect(applied.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('err applies to ok value', () => {
      const applied = Err('error').chain(Result.applyTo(Ok('42')));
      expect(applied.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('erro value applies to err', () => {
      const applied = Err('error').chain(Result.applyTo(Err('apply')));
      expect(applied.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('applies a curried function multiple times to ok values', () => {
      const applied = Ok((a: number) => (b: number) => (c: number) => a + b + c)
        .chain(Result.applyTo(Ok(1)))
        .chain(Result.applyTo(Ok(2)))
        .chain(Result.applyTo(Ok(3)));
      expect(applied.result).toEqual({ tag: 'ok', value: 6 });
    });

    it('applies a curried function multiple times to ok and err values', () => {
      const applied = Ok((a: number) => (b: number) => (c: number) => a + b + c)
        .chain(Result.applyTo(Ok(1)))
        .chain(Result.applyTo(Err('error')))
        .chain(Result.applyTo(Ok(3)));
      expect(applied.result).toEqual({ tag: 'err', error: 'error' });
    });
  });

  describe('join', () => {
    it('joins nested ok values', () => {
      const joined = Result.join(Ok(Ok(42)));
      expect(joined.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('joins nested ok and err values', () => {
      const joined = Result.join(Ok(Err('error')));
      expect(joined.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('joins nested err value', () => {
      const joined = Result.join(Err('error'));
      expect(joined.result).toEqual({ tag: 'err', error: 'error' });
    });
  });

  describe('fromOptional', () => {
    it('gets ok from value', () => {
      const res = Maybe.fromOptional(42).toResult('error');
      expect(res.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('gets err from undefined', () => {
      const res = Maybe.fromOptional(undefined).toResult('error');
      expect(res.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('gets ok from null', () => {
      const res = Maybe.fromOptional(null).toResult('error');
      expect(res.result).toEqual({ tag: 'ok', value: null });
    });
  });

  describe('fromNullable', () => {
    it('gets ok from value', () => {
      const res = Maybe.fromNullable(42).toResult('error');
      expect(res.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('gets err from undefined', () => {
      const res = Maybe.fromNullable(undefined).toResult('error');
      expect(res.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('gets nothing from null', () => {
      const res = Maybe.fromNullable(null).toResult('error');
      expect(res.result).toEqual({ tag: 'err', error: 'error' });
    });
  });

  describe('fromNumber', () => {
    it('gets just from number', () => {
      const res = Maybe.fromNumber(42).toResult('error');
      expect(res.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('gets nothing from NaN', () => {
      const res = Maybe.fromNumber(NaN).toResult('error');
      expect(res.result).toEqual({ tag: 'err', error: 'error' });
    });
  });

  describe('unwrap', () => {
    it('switch case for ok', () => {
      const unwrapped = Ok(42).result;
      switch (unwrapped.tag) {
      case 'ok': {
        expect(unwrapped.value).toBe(42);
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });

    it('switch case for err', () => {
      const unwrapped = Err('error').result;
      switch (unwrapped.tag) {
      case 'err': {
        expect(unwrapped.error).toBe('error');
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });
  });

  describe('record', () => {
    it('gets ok from a record of oks', () => {
      expect(Result.record({
        first: Ok(1),
        second: Ok(2),
        third: Ok(3)
      }).result).toEqual({
        tag: 'ok',
        value: {
          first: 1,
          second: 2,
          third: 3
        }
      });
    });

    it('gets error from a record with single error', () => {
      expect(Result.record({
        first: Ok(1),
        second: Err('error'),
        third: Ok(3)
      }).result).toEqual({
        tag: 'err',
        error: 'error'
      });
    });

    it ('gets the error from the first error', () => {
      expect(Result.record({
        first:  Err('first'),
        second: Err('second'),
        third: Err('third')
      }).result).toEqual({
        tag: 'err',
        error: 'first'
      });
    });
  });

  describe('all', () => {
    it('gets ok from array of oks', () => {
      expect(Result.all([Ok(1), Ok(2), Ok(3)]).result).toEqual({
        tag: 'ok', value: [1, 2, 3]
      });
    });

    it('gets err from array with single err', () => {
      expect(Result.all([Ok(1), Err('error'), Ok(3)]).result).toEqual({
        tag: 'err', error: 'error'
      });
    });

    it('gets first error from array with multiple errors', () => {
      expect(Result.all([Err('first'), Err('second'), Err('third')]).result).toEqual({
        tag: 'err', error: 'first'
      });
    });

    it('gets ok from empty array', () => {
      expect(Result.all([]).result).toEqual({
        tag: 'ok', value: []
      });
    });
  });

  describe('some', () => {
    it('gets first error from array with errors', () => {
      expect(
        Result.some([Err('first'), Err('second'), Err('third')]).result
      ).toEqual({ tag: 'err', error: 'first'});
    });

    it('gets ok from array with single ok', () => {
      expect(
        Result.some([Err('first'), Ok(2), Err('third')]).result
      ).toEqual({ tag: 'ok', value: 2 });
    });

    it('gets first ok from array with multiple oks', () => {
      expect(
        Result.some([Ok(1), Ok(2), Ok(3)]).result
      ).toEqual({ tag: 'ok', value: 1 });
    });
  });


  describe('values', () => {
    it('gets values from array with oks', () => {
      expect(
        Result.values([Ok(1), Ok(2), Ok(3)])
      ).toEqual([1,2,3]);
    });

    it('gets oks from array with error', () => {
      expect(
        Result.values([Ok(1), Err('error'), Ok(3)])
      ).toEqual([1, 3]);
    });

    it('gets empty array from empty array', () => {
      expect(
        Result.values([])
      ).toEqual([]);
    });
  });
});
