import { Maybe } from '../maybe';
import Result, { Err, Ok } from '../result';

describe('Result', () => {
  it('Ok', () => {
    const ok = Ok(42);
    expect(ok.base).toEqual({ tag: 'ok', value: 42 });
    expect(ok.tag).toBe('ok');
    expect(ok.get()).toBe(42);
    expect(ok.getError().get()).toBe(undefined);
    expect(ok.getValue().get()).toBe(42);
  });

  it('Err', () => {
    const err = Err('error');
    expect(err.base).toEqual({ tag: 'err', error: 'error' });
    expect(err.tag).toBe('err');
    expect(err.get()).toBe(undefined);
    expect(err.getError().get()).toBe('error');
    expect(err.getValue().get()).toBe(undefined);
  });

  describe('functor laws', () => {
    it('identity', () => {
      expect(Ok(42).map((v) => v).base).toEqual(Ok(42).base);
    });

    it('composition', () => {
      const f = (v: number) => v * 2;
      const g = (v: number) => v + 2;
      expect(Ok(42).map(f).map(g).base).toEqual(
        Ok(42).map((v) => g(f(v))).base
      );
    });
  });

  describe('applicative laws', () => {
    it('identity', () => {
      const left = Ok((v: number) => v).apply(Ok(42));
      const right = Ok(42);
      expect(left.base).toEqual(right.base);
    });

    it('homomorphism', () => {
      const f = (v: number) => v * 2;
      const left = Ok(f).apply(Ok(42));
      const right = Ok(f(42));
      expect(left.base).toEqual(right.base);
    });

    it('interchange', () => {
      const f = (v: number) => v * 2;
      const left = Ok(f).apply(Ok(42));
      const right = Ok((g: typeof f) => g(42)).apply(Ok(f));
      expect(left.base).toEqual(right.base);
    });

    it('composition', () => {
      const u = Ok((b: boolean) => [b]);
      const v = Ok((a: number) => a > 0);
      const w = Ok(42);
      const compose = (f: (b: boolean) => Array<boolean>) =>
        (g: (a: number) => boolean) =>
          (a: number): Array<boolean> =>
            f(g(a));
      const left = Ok(compose)
        .apply(u)
        .apply(v)
        .apply(w);
      const right = u.apply(v.apply(w));
      expect(left.base).toEqual(right.base);
    });
  });

  describe('monad laws', () => {
    it('left identity', () => {
      const ret = <A>(n: A) => Ok(n);
      const f = (n: number) => Ok(n * 2);
      const left = ret(42).chain(f);
      const right = f(42);
      expect(left.base).toEqual(right.base);
    });

    it('right identity', () => {
      const ret = <A>(n: A) => Ok(n);
      const left = Ok(42).chain(ret);
      const right = Ok(42);
      expect(left.base).toEqual(right.base);
    });

    it('associativity', () => {
      const m = Ok(42);
      const f = (n: number) => Ok(n + 2);
      const g = (n: number) => Ok(n * 2);
      const left = m.chain(f).chain(g);
      const right = m.chain((v) => f(v).chain(g));
      expect(left.base).toEqual(right.base);
    });
  });

  describe('map', () => {
    it('maps ok value', () => {
      const mapped = Ok(42).map((num) => num * 2);
      expect(mapped.base).toEqual({ tag: 'ok', value: 84 });
    });

    it('maps err value', () => {
      const mapped = Err<string, number>('error').map((num) => num * 2);
      expect(mapped.base).toEqual({ tag: 'err', error: 'error' });
    });
  });

  describe('mapError', () => {
    it('maps err value', () => {
      const mapped = Err('error').mapError((str) => str.toUpperCase());
      expect(mapped.base).toEqual({ tag: 'err', error: 'ERROR' });
    });

    it('maps ok value', () => {
      const mapped = Ok(42).mapError((str) => str.toUpperCase());
      expect(mapped.base).toEqual({ tag: 'ok', value: 42 });
    });
  });

  describe('chain', () => {
    it('chains ok value', () => {
      const chained = Ok(42).chain((num) => Ok(num * 2));
      expect(chained.base).toEqual({ tag: 'ok', value: 84 });
    });

    it('chains err value', () => {
      const chained = Err<string, number>('error').chain((num) => Ok(num * 2));
      expect(chained.base).toEqual({ tag: 'err', error: 'error' });
    });
  });

  describe('or', () => {
    it('ok or ok returns ok', () => {
      const or = Ok(42).or(Ok(0));
      expect(or.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('ok or err returns ok', () => {
      const or = Ok(42).or(Err('error'));
      expect(or.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('err or ok returns ok', () => {
      const or = Err<string, number>('error').or(Ok(42));
      expect(or.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('err or err returns err', () => {
      const or = Err('first').or(Err('second'));
      expect(or.base).toEqual({ tag: 'err', error: 'first' });
    });
  });

  describe('orElse', () => {
    it('ok orElse ok returns ok', () => {
      const or = Ok(42).orElse(Ok(0));
      expect(or.base).toEqual({ tag: 'ok', value: 0 });
    });

    it('ok orElse err returns ok', () => {
      const or = Ok(42).orElse(Err('error'));
      expect(or.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('err orElse ok returns ok', () => {
      const or = Err<string, number>('error').orElse(Ok(42));
      expect(or.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('err orElse err returns err', () => {
      const or = Err('first').orElse(Err('second'));
      expect(or.base).toEqual({ tag: 'err', error: 'second' });
    });
  });

  describe('default', () => {
    it('ok defaults to itself', () => {
      const def = Ok(42).default(0);
      expect(def.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('err defaults to default', () => {
      const def = Err('error').default(0);
      expect(def.base).toEqual({ tag: 'ok', value: 0 });
    });

    it('err defaults to first default', () => {
      const def = Err('error').default(0).default(-1);
      expect(def.base).toEqual({ tag: 'ok', value: 0 });
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

  describe('toMaybe', () => {
    it('gets just from ok value', () => {
      const maybe = Ok(42).toMaybe();
      expect(maybe.base).toEqual({ tag: 'just', value: 42 });
    });

    it('gets nothing from err value', () => {
      const maybe = Err('error').toMaybe();
      expect(maybe.base).toEqual({ tag: 'nothing' });
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
      expect(maybe.base).toEqual({ tag: 'just', value: 42 });
    });

    it('gets nothing from err value', () => {
      const maybe = Err('error').getValue();
      expect(maybe.base).toEqual({ tag: 'nothing' });
    });
  });

  describe('getError', () => {
    it('gets nothing from ok value', () => {
      const maybe = Ok(42).getError();
      expect(maybe.base).toEqual({ tag: 'nothing' });
    });

    it('gets just from err value', () => {
      const maybe = Err('error').getError();
      expect(maybe.base).toEqual({ tag: 'just', value: 'error' });
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

  describe('apply', () => {
    it('ok function applies to ok value', () => {
      const applied = Ok((str: string) => parseInt(str, 10)).apply(Ok('42'));
      expect(applied.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('ok function applies to err', () => {
      const applied = Ok((str: string) => parseInt(str, 10)).apply(Err('error'));
      expect(applied.base).toEqual({ tag: 'err', error: 'error' });
    });

    it ('cannot apply ok not containing a function', () => {
      const applied = Ok(0)
        /* @ts-expect-error testing */
        .apply(Ok(42));
      expect(applied.base).toEqual({tag: 'ok', value: 42 });
    });

    it('cannot apply err to ok value', () => {
      const applied = Err('error')
      /* @ts-expect-error testing */
        .apply(Ok('42'));
      expect(applied.base).toEqual({ tag: 'err', error: 'error' });
    });

    it('err value applies to err', () => {
      const applied = Err('error').apply(Err('apply'));
      expect(applied.base).toEqual({ tag: 'err', error: 'error' });
    });

    it('applies a curried function multiple times to ok values', () => {
      const applied = Ok((a: number) => (b: number) => (c: number) => a + b * c)
        .apply(Ok(1))
        .apply(Ok(2))
        .apply(Ok(3));
      expect(applied.base).toEqual({ tag: 'ok', value: 7 });
    });

    it('applies a curried function multiple times to ok and err values', () => {
      const applied = Ok((a: number) => (b: number) => (c: number) => a + b + c)
        .apply(Ok(1))
        .apply(Err('error'))
        .apply(Ok(3));
      expect(applied.base).toEqual({ tag: 'err', error: 'error' });
    });

    it('autocurries function', () => {
      const applied = Ok((a: number, b: number, c: number) => a + b * c)
        .apply(Ok(1))
        .apply(Ok(2))
        .apply(Ok(3));
      expect(applied.base).toEqual({ tag: 'ok', value: 7 });
    });
  });

  describe('join', () => {
    it('joins nested ok values', () => {
      const joined = Ok(Ok(42)).join();
      expect(joined.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('joins nested ok and err values', () => {
      const joined = Ok(Err('error')).join();
      expect(joined.base).toEqual({ tag: 'err', error: 'error' });
    });

    it('joins nested err value', () => {
      const joined = Err<string, Result<string, number>>('error').join();
      expect(joined.base).toEqual({ tag: 'err', error: 'error' });
    });

    it('cannot join single ok value', () => {
      const joined = Ok(42).join();
      /* @ts-expect-error testing */
      expect(joined.base).toEqual({ tag: 'ok', value: 42 });
    });
  });

  describe('fromOptional', () => {
    it('gets ok from value', () => {
      const res = Maybe.fromOptional(42).toResult('error');
      expect(res.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('gets err from undefined', () => {
      const res = Maybe.fromOptional(undefined).toResult('error');
      expect(res.base).toEqual({ tag: 'err', error: 'error' });
    });

    it('gets ok from null', () => {
      const res = Maybe.fromOptional(null).toResult('error');
      expect(res.base).toEqual({ tag: 'ok', value: null });
    });
  });

  describe('fromNullable', () => {
    it('gets ok from value', () => {
      const res = Maybe.fromNullable(42).toResult('error');
      expect(res.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('gets err from undefined', () => {
      const res = Maybe.fromNullable(undefined).toResult('error');
      expect(res.base).toEqual({ tag: 'err', error: 'error' });
    });

    it('gets nothing from null', () => {
      const res = Maybe.fromNullable(null).toResult('error');
      expect(res.base).toEqual({ tag: 'err', error: 'error' });
    });
  });

  describe('fromNumber', () => {
    it('gets just from number', () => {
      const res = Maybe.fromNumber(42).toResult('error');
      expect(res.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('gets nothing from NaN', () => {
      const res = Maybe.fromNumber(NaN).toResult('error');
      expect(res.base).toEqual({ tag: 'err', error: 'error' });
    });
  });

  describe('unwrap', () => {
    it('switch case for ok', () => {
      const unwrapped = Ok(42).base;
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
      const unwrapped = Err('error').base;
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
      }).base).toEqual({
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
      }).base).toEqual({
        tag: 'err',
        error: 'error'
      });
    });

    it ('gets the error from the first error', () => {
      expect(Result.record({
        first:  Err('first'),
        second: Err('second'),
        third: Err('third')
      }).base).toEqual({
        tag: 'err',
        error: 'first'
      });
    });
  });

  describe('all', () => {
    it('gets ok from array of oks', () => {
      expect(Result.all([Ok(1), Ok(2), Ok(3)]).base).toEqual({
        tag: 'ok', value: [1, 2, 3]
      });
    });

    it('gets err from array with single err', () => {
      expect(Result.all([Ok(1), Err('error'), Ok(3)]).base).toEqual({
        tag: 'err', error: 'error'
      });
    });

    it('gets first error from array with multiple errors', () => {
      expect(Result.all([Err('first'), Err('second'), Err('third')]).base).toEqual({
        tag: 'err', error: 'first'
      });
    });

    it('gets ok from empty array', () => {
      expect(Result.all([]).base).toEqual({
        tag: 'ok', value: []
      });
    });

    it('test typings', () => {
      const [num, bool, str] = Result.all([
        Ok(42), Ok(true), Ok('str')
      ]).getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });


  describe('array', () => {
    it('gets ok from array of oks', () => {
      expect(Result.array([Ok(1), Ok(2), Ok(3)]).base).toEqual({
        tag: 'ok', value: [1, 2, 3]
      });
    });

    it('gets err from array with single err', () => {
      expect(Result.array([Ok(1), Err('error'), Ok(3)]).base).toEqual({
        tag: 'err', error: 'error'
      });
    });

    it('gets first error from array with multiple errors', () => {
      expect(Result.array([Err('first'), Err('second'), Err('third')]).base).toEqual({
        tag: 'err', error: 'first'
      });
    });

    it('gets ok from empty array', () => {
      expect(Result.array([]).base).toEqual({
        tag: 'ok', value: []
      });
    });

    it('test typings', () => {
      const [num, bool, str] = Result.array([
        Ok(42), Ok(true), Ok('str')
      ]).getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });

  describe('some', () => {
    it('gets first error from array with errors', () => {
      expect(
        Result.some([Err('first'), Err('second'), Err('third')]).base
      ).toEqual({ tag: 'err', error: 'first'});
    });

    it('gets ok from array with single ok', () => {
      expect(
        Result.some([Err<string, number>('first'), Ok(2), Err<string, number>('third')]).base
      ).toEqual({ tag: 'ok', value: 2 });
    });

    it('gets first ok from array with multiple oks', () => {
      expect(
        Result.some([Ok(1), Ok(2), Ok(3)]).base
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

  describe('applyAll', () => {
    it ('applies function to array of oks', () => {
      const applied = Result.applyAll((a, b) => a + b, [Ok(42), Ok(69)]);
      expect(applied.base).toEqual({tag: 'ok', value: 111});
    });

    it ('applies function to array with one err', () => {
      const applied = Result.applyAll((a, b) => a + b, [Ok(42), Err('error')]);
      expect(applied.base).toEqual({tag: 'err', error: 'error' });
    });

    it ('test typings', () => {
      const applied = Result.applyAll(
        (a: number, b: boolean, c: string) => [a,b,c] as const,
        [Ok(42), Ok(true), Ok('str')]);
      const [num, bool, str] = applied.getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });


  describe('toEither', () => {
    it('gets right from ok', () => {
      expect(Ok(42).toEither().base).toEqual({
        tag: 'right', value: 42
      });
    });

    it('gets left from err', () => {
      expect(Err('error').toEither().base).toEqual({
        tag: 'left', value: 'error'
      });
    });
  });
});
