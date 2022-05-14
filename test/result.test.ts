import { Maybe } from '../maybe';
import { applyTo, Err, join, Ok } from '../result';

describe('Result', () => {
  it('Ok', () => {
    const ok = Ok(42);
    expect(ok.result).toEqual({ tag: 'ok', value: 42 });
    expect(ok.value).toBe(42);
    expect(ok.error).toBe(undefined);
    expect(ok.get()).toBe(42);
    expect(ok.getError().get()).toBe(undefined);
    expect(ok.getValue().get()).toBe(42);
  });

  it('Err', () => {
    const err = Err('error');
    expect(err.result).toEqual({ tag: 'err', error: 'error' });
    expect(err.value).toBe(undefined);
    expect(err.error).toBe('error');
    expect(err.get()).toBe(undefined);
    expect(err.getError().get()).toBe('error');
    expect(err.getValue().get()).toBe(undefined);
  });

  describe('map', () => {
    it ('maps ok value', () => {
      const mapped = Ok(42).map((num) => num * 2);
      expect(mapped.result).toEqual({tag: 'ok', value: 84});
    });

    it ('maps err value', () => {
      const mapped = Err('error').map((num) => num * 2);
      expect(mapped.result).toEqual({tag: 'err', error: 'error'});
    });
  });

  describe('mapError', () => {
    it ('maps err value', () => {
      const mapped = Err('error').mapError((str) => str.toUpperCase());
      expect(mapped.result).toEqual({tag: 'err', error: 'ERROR' });
    });

    it ('maps ok value', () => {
      const mapped = Ok(42).mapError((str) => str.toUpperCase());
      expect(mapped.result).toEqual({tag: 'ok', value: 42 });
    });
  });


  describe('chain', () => {
    it ('chains ok value', () => {
      const chained = Ok(42).chain((num) => Ok(num * 2));
      expect(chained.result).toEqual({tag: 'ok', value: 84});
    });

    it ('chains err value', () => {
      const chained = Err('error').chain((num) => Ok(num * 2));
      expect(chained.result).toEqual({tag: 'err', error: 'error'});
    });
  });

  describe('or', () => {
    it ('ok or ok returns ok', () => {
      const or = Ok(42).or(Ok(0));
      expect(or.result).toEqual({tag: 'ok', value: 42});
    });

    it ('ok or err returns ok', () => {
      const or = Ok(42).or(Err('error'));
      expect(or.result).toEqual({tag: 'ok', value: 42});
    });

    it ('err or ok returns ok', () => {
      const or = Err('error').or(Ok(42));
      expect(or.result).toEqual({tag: 'ok', value: 42});
    });

    it ('err or err returns err', () => {
      const or = Err('first').or(Err('second'));
      expect(or.result).toEqual({tag: 'err', error: 'first' });
    });
  });

  describe('orElse', () => {
    it ('ok orElse ok returns ok', () => {
      const or = Ok(42).orElse(Ok(0));
      expect(or.result).toEqual({tag: 'ok', value: 0});
    });

    it ('ok orElse err returns ok', () => {
      const or = Ok(42).orElse(Err('error'));
      expect(or.result).toEqual({tag: 'ok', value: 42});
    });

    it ('err orElse ok returns ok', () => {
      const or = Err('error').orElse(Ok(42));
      expect(or.result).toEqual({tag: 'ok', value: 42});
    });

    it ('err orElse err returns err', () => {
      const or = Err('first').orElse(Err('second'));
      expect(or.result).toEqual({tag: 'err', error: 'second' });
    });
  });

  describe('default', () => {
    it ('ok defaults to itself', () => {
      const def = Ok(42).default(0);
      expect(def.result).toEqual({tag: 'ok', value: 42});
    });

    it ('err defaults to default', () => {
      const def = Err('error').default(0);
      expect(def.result).toEqual({tag: 'ok', value: 0});
    });


    it ('err defaults to first default', () => {
      const def = Err('error').default(0).default(-1);
      expect(def.result).toEqual({tag: 'ok', value: 0});
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
        () => 'str',
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
      expect(maybe.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it ('gets nothing from err value', () => {
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
    it ('gets just from ok value', () => {
      const maybe = Ok(42).getValue();
      expect(maybe.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it ('gets nothing from err value', () => {
      const maybe = Err('error').getValue();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('getError', () => {
    it ('gets nothing from ok value', () => {
      const maybe = Ok(42).getError();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it ('gets just from err value', () => {
      const maybe = Err('error').getError();
      expect(maybe.maybe).toEqual({ tag: 'just', value: 'error' });
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
      expect(applied.result).toEqual({tag: 'ok', value: 42});
    });

    it('ok function applies to err', () => {
      const applied =  Ok(
        (str: string) => parseInt(str, 10)
      ).chain(applyTo(Err('error')));
      expect(applied.result).toEqual({tag: 'err', error: 'error'});
    });

    it('err applies to ok value', () => {
      const applied =  Err('error').chain(applyTo(Ok('42')));
      expect(applied.result).toEqual({tag: 'err', error: 'error'});
    });

    it('erro value applies to err', () => {
      const applied = Err('error').chain(applyTo(Err('apply')));
      expect(applied.result).toEqual({tag: 'err', error: 'error'});
    });

    it('applies a curried function multiple times to ok values', () => {
      const applied =  Ok(
        (a: number) => (b: number) => (c: number) => a + b + c
      )
        .chain(applyTo(Ok(1)))
        .chain(applyTo(Ok(2)))
        .chain(applyTo(Ok(3)));
      expect(applied.result).toEqual({tag: 'ok', value: 6});
    });

    it('applies a curried function multiple times to ok and err values', () => {
      const applied =  Ok(
        (a: number) => (b: number) => (c: number) => a + b + c
      )
        .chain(applyTo(Ok(1)))
        .chain(applyTo(Err('error')))
        .chain(applyTo(Ok(3)));
      expect(applied.result).toEqual({tag: 'err', error: 'error'});
    });
  });

  describe('join', () => {
    it('joins nested ok values', () => {
      const joined = join(Ok(Ok(42)));
      expect(joined.result).toEqual({tag: 'ok', value: 42});
    });

    it('joins nested ok and err values', () => {
      const joined = join(Ok(Err('error')));
      expect(joined.result).toEqual({tag: 'err', error: 'error'});
    });

    it('joins nested err value', () => {
      const joined = join(Err('error'));
      expect(joined.result).toEqual({tag: 'err', error: 'error'});
    });
  });

  describe('fromOptional', () => {
    it('gets ok from value', () => {
      const res = Maybe.fromOptional(42).toResult('error');
      expect(res.result).toEqual({tag: 'ok', value: 42});
    });

    it('gets err from undefined', () => {
      const res = Maybe.fromOptional(undefined).toResult('error');
      expect(res.result).toEqual({tag: 'err', error: 'error'});
    });

    it('gets ok from null', () => {
      const res = Maybe.fromOptional(null).toResult('error');
      expect(res.result).toEqual({tag: 'ok', value: null});
    });
  });

  describe('fromNullable', () => {
    it('gets ok from value', () => {
      const res = Maybe.fromNullable(42).toResult('error');
      expect(res.result).toEqual({tag: 'ok', value: 42});
    });

    it('gets err from undefined', () => {
      const res = Maybe.fromNullable(undefined).toResult('error');
      expect(res.result).toEqual({tag: 'err', error: 'error'});
    });

    it('gets nothing from null', () => {
      const res = Maybe.fromNullable(null).toResult('error');
      expect(res.result).toEqual({tag: 'err', error: 'error'});
    });
  });

  describe('fromNumber', () => {
    it('gets just from number', () => {
      const res = Maybe.fromNumber(42).toResult('error');
      expect(res.result).toEqual({tag: 'ok', value: 42});
    });

    it('gets nothing from NaN', () => {
      const res = Maybe.fromNumber(NaN).toResult('error');
      expect(res.result).toEqual({tag: 'err', error: 'error'});
    });
  });

  describe('unwrap', () => {
    it('switch case for ok', () => {
      const unwrapped = Ok(42).result;
      switch(unwrapped.tag) {
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
      switch(unwrapped.tag) {
      case 'err': {
        expect(unwrapped.error).toBe('error');
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });
  });
});