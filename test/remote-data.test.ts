import { Maybe } from '../maybe';
import RemoteData, { Failure, Loading, NotAsked, Success } from '../remote-data';


describe('RemoteData', () => {
  it('Success', () => {
    const success = Success(42);
    expect(success.base).toEqual({ tag: 'success', value: 42 });
    expect(success.tag).toBe('success');
    expect(success.get()).toBe(42);
    expect(success.getError().get()).toBe(undefined);
    expect(success.getValue().get()).toBe(42);
  });

  it('Failure', () => {
    const fail = Failure('error');
    expect(fail.base).toEqual({ tag: 'failure', error: 'error' });
    expect(fail.tag).toBe('failure');
    expect(fail.get()).toBe(undefined);
    expect(fail.getError().get()).toBe('error');
    expect(fail.getValue().get()).toBe(undefined);
  });

  it('Loading', () => {
    expect(Loading().base).toEqual({ tag: 'loading' });
    expect(Loading().tag).toBe('loading');
    expect(Loading().get()).toBe(undefined);
    expect(Loading().getError().get()).toBe(undefined);
    expect(Loading().getValue().get()).toBe(undefined);
  });

  it('StandBy', () => {
    expect(NotAsked().base).toEqual({ tag: 'not asked' });
    expect(NotAsked().tag).toBe('not asked');
    expect(NotAsked().get()).toBe(undefined);
    expect(NotAsked().getError().get()).toBe(undefined);
    expect(NotAsked().getValue().get()).toBe(undefined);
  });

  describe('functor laws', () => {
    it('identity', () => {
      expect(Success(42).map((v) => v).base).toEqual(Success(42).base);
    });

    it('composition', () => {
      const f = (v: number) => v * 2;
      const g = (v: number) => v + 2;
      expect(Success(42).map(f).map(g).base).toEqual(
        Success(42).map((v) => g(f(v))).base
      );
    });
  });


  describe('applicative laws', () => {
    it('identity', () => {
      const left = Success((v: number) => v).apply(Success(42));
      const right = Success(42);
      expect(left.base).toEqual(right.base);
    });

    it('homomorphism', () => {
      const f = (v: number) => v * 2;
      const left = Success(f).apply(Success(42));
      const right = Success(f(42));
      expect(left.base).toEqual(right.base);
    });

    it('interchange', () => {
      const f = (v: number) => v * 2;
      const left = Success(f).apply(Success(42));
      const right = Success((g: typeof f) => g(42)).apply(Success(f));
      expect(left.base).toEqual(right.base);
    });

    it('composition', () => {
      const u = Success((b: boolean) => [b]);
      const v = Success((a: number) => a > 0);
      const w = Success(42);
      const compose = (f: (b: boolean) => Array<boolean>) =>
        (g: (a: number) => boolean) =>
          (a: number): Array<boolean> =>
            f(g(a));
      const left = Success(compose)
        .apply(u)
        .apply(v)
        .apply(w);
      const right = u.apply(v.apply(w));
      expect(left.base).toEqual(right.base);
    });
  });


  describe('monad laws', () => {
    it('left identity', () => {
      const ret = <A>(n: A) => Success(n);
      const f = (n: number) => Success(n * 2);
      const left = ret(42).chain(f);
      const right = f(42);
      expect(left.base).toEqual(right.base);
    });

    it('right identity', () => {
      const ret = <A>(n: A) => Success(n);
      const left = Success(42).chain(ret);
      const right = Success(42);
      expect(left.base).toEqual(right.base);
    });

    it('associativity', () => {
      const m = Success(42);
      const f = (n: number) => Success(n + 2);
      const g = (n: number) => Success(n * 2);
      const left = m.chain(f).chain(g);
      const right = m.chain((v) => f(v).chain(g));
      expect(left.base).toEqual(right.base);
    });
  });

  describe('map', () => {
    it('maps success value', () => {
      const mapped = Success(42).map((num) => num * 2);
      expect(mapped.base).toEqual({ tag: 'success', value: 84 });
    });

    it('maps failure value', () => {
      const mapped = Failure('error').map((num) => num * 2);
      expect(mapped.base).toEqual({ tag: 'failure', error: 'error' });
    });

    it('maps loading value', () => {
      const mapped = Loading().map((num) => num * 2);
      expect(mapped.base).toEqual({ tag: 'loading' });
    });

    it('maps not asked value', () => {
      const mapped = NotAsked().map((num) => num * 2);
      expect(mapped.base).toEqual({ tag: 'not asked' });
    });
  });

  describe('mapError', () => {
    it('maps success value', () => {
      const mapped = Success(42).mapError((str) => str.toUpperCase());
      expect(mapped.base).toEqual({ tag: 'success', value: 42 });
    });

    it('maps failure value', () => {
      const mapped = Failure('error').mapError((str) => str.toUpperCase());
      expect(mapped.base).toEqual({ tag: 'failure', error: 'ERROR' });
    });

    it('maps loading value', () => {
      const mapped = Loading().mapError((str) => str.toUpperCase());
      expect(mapped.base).toEqual({ tag: 'loading' });
    });

    it('maps not asked value', () => {
      const mapped = NotAsked().mapError((str) => str.toUpperCase());
      expect(mapped.base).toEqual({ tag: 'not asked' });
    });
  });

  describe('chain', () => {
    it('chains success value', () => {
      const mapped = Success(42).chain((num) => Success(num * 2));
      expect(mapped.base).toEqual({ tag: 'success', value: 84 });
    });

    it('chains failure value', () => {
      const mapped = Failure('error').chain((num) => Success(num * 2));
      expect(mapped.base).toEqual({ tag: 'failure', error: 'error' });
    });

    it('chains loading value', () => {
      const mapped = Loading().chain((num) => Success(num * 2));
      expect(mapped.base).toEqual({ tag: 'loading' });
    });

    it('chains not asked value', () => {
      const mapped = NotAsked().chain((num) => Success(num * 2));
      expect(mapped.base).toEqual({ tag: 'not asked' });
    });
  });


  describe('or', () => {
    it('success or success returns success', () => {
      const or = Success(42).or(Success(0));
      expect(or.base).toEqual({ tag: 'success', value: 42 });
    });

    it('success or failure returns success', () => {
      const or = Success(42).or(Failure('error'));
      expect(or.base).toEqual({ tag: 'success', value: 42 });
    });

    it('failure or success returns success', () => {
      const or = Failure('error').or(Success(42));
      expect(or.base).toEqual({ tag: 'success', value: 42 });
    });

    it('failure or failure returns failure', () => {
      const or = Failure('first').or(Failure('second'));
      expect(or.base).toEqual({ tag: 'failure', error: 'first' });
    });

    it('loading or not asked returns loading', () => {
      const or = Loading().or(NotAsked());
      expect(or.base).toEqual({ tag: 'loading' });
    });
  });

  describe('orElse', () => {
    it('success or success returns success', () => {
      const or = Success(42).orElse(Success(0));
      expect(or.base).toEqual({ tag: 'success', value: 0 });
    });

    it('success or failure returns success', () => {
      const or = Success(42).orElse(Failure('error'));
      expect(or.base).toEqual({ tag: 'success', value: 42 });
    });

    it('failure or success returns success', () => {
      const or = Failure('error').orElse(Success(42));
      expect(or.base).toEqual({ tag: 'success', value: 42 });
    });

    it('failure or failure returns failure', () => {
      const or = Failure('first').orElse(Failure('second'));
      expect(or.base).toEqual({ tag: 'failure', error: 'second' });
    });

    it('loading or not asked returns not asked', () => {
      const or = Loading().orElse(NotAsked());
      expect(or.base).toEqual({ tag: 'not asked' });
    });
  });


  describe('default', () => {
    it('success defaults to itself', () => {
      const def = Success(42).default(0);
      expect(def.base).toEqual({ tag: 'success', value: 42 });
    });

    it('failure defaults to default', () => {
      const def = Failure('error').default(0);
      expect(def.base).toEqual({ tag: 'success', value: 0 });
    });

    it('loading defaults to default', () => {
      const def = Loading().default(0);
      expect(def.base).toEqual({ tag: 'success', value: 0 });
    });

    it('not asked defaults to default', () => {
      const def = NotAsked().default(0);
      expect(def.base).toEqual({ tag: 'success', value: 0 });
    });

    it('failure defaults to first default', () => {
      const def = Failure('error').default(0).default(-1);
      expect(def.base).toEqual({ tag: 'success', value: 0 });
    });
  });

  describe('fold', () => {
    it('folds success value', () => {
      const folded = Success(42).fold({
        failure: () => 69,
        loading: () => 69,
        notAsked: () => 69,
        success: (num) => num / 2
      });
      expect(folded).toBe(21);
    });

    it('folds failure value', () => {
      const folded = Failure('error').fold({
        failure: (err) => err.toUpperCase(),
        loading: () => 'str',
        notAsked: () => 'str',
        success: () => 'str'
      });
      expect(folded).toBe('ERROR');
    });

    it('folds loading value', () => {
      const folded = Loading().fold({
        failure: (err) => err.toUpperCase(),
        loading: () => 'loading',
        notAsked: () => 'str',
        success: () => 'str'
      });
      expect(folded).toBe('loading');
    });

    it('folds not asked value', () => {
      let folded = NotAsked().fold({
        failure: (err) => err.toUpperCase(),
        loading: () => 'str',
        'not asked': () => 'not asked',
        success: () => 'str'
      });
      expect(folded).toBe('not asked');

      folded = NotAsked().fold({
        failure: (err) => err.toUpperCase(),
        loading: () => 'str',
        notAsked: () => 'notAsked',
        success: () => 'str'
      });
      expect(folded).toBe('notAsked');
    });
  });

  describe('toMaybe', () => {
    it('gets just from success value', () => {
      const maybe = Success(42).toMaybe();
      expect(maybe.base).toEqual({ tag: 'just', value: 42 });
    });

    it('gets nothing from failure value', () => {
      const maybe = Failure('error').toMaybe();
      expect(maybe.base).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from loading value', () => {
      const maybe = Loading().toMaybe();
      expect(maybe.base).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from not asked value', () => {
      const maybe = NotAsked().toMaybe();
      expect(maybe.base).toEqual({ tag: 'nothing' });
    });
  });


  describe('getOrElse', () => {
    it('gets value from success', () => {
      expect(Success(42).getOrElse(0)).toBe(42);
    });

    it('gets value from failure', () => {
      expect(Failure('error').getOrElse(0)).toBe(0);
    });

    it('gets value from loading', () => {
      expect(Loading().getOrElse(0)).toBe(0);
    });

    it('gets value from not asked', () => {
      expect(NotAsked().getOrElse(0)).toBe(0);
    });

    it('gets value from null success', () => {
      expect(Success<number | null>(null).getOrElse(0)).toBe(null);
      expect(Success<number | undefined>(undefined).getOrElse(0)).toBe(undefined);
    });
  });

  describe('getValue', () => {
    it('gets just from success value', () => {
      const maybe = Success(42).getValue();
      expect(maybe.base).toEqual({ tag: 'just', value: 42 });
    });

    it('gets nothing from loading value', () => {
      const maybe = Loading().getValue();
      expect(maybe.base).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from not asked value', () => {
      const maybe = NotAsked().getValue();
      expect(maybe.base).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from failure value', () => {
      const maybe = Failure('error').getValue();
      expect(maybe.base).toEqual({ tag: 'nothing' });
    });
  });

  describe('getError', () => {
    it('gets nohting from success value', () => {
      const maybe = Success(42).getError();
      expect(maybe.base).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from loading value', () => {
      const maybe = Loading().getError();
      expect(maybe.base).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from not asked value', () => {
      const maybe = NotAsked().getError();
      expect(maybe.base).toEqual({ tag: 'nothing' });
    });

    it('gets just from failure value', () => {
      const maybe = Failure('error').getError();
      expect(maybe.base).toEqual({ tag: 'just', value: 'error' });
    });
  });

  describe('toString', () => {
    it('prints success value', () => {
      expect(Success(42).toString()).toBe('Success(42)');
    });

    it('prints failure value', () => {
      expect(Failure('error').toString()).toBe('Failure(error)');
    });

    it('prints loading value', () => {
      expect(Loading().toString()).toBe('Loading');
    });

    it('prints not asked value', () => {
      expect(NotAsked().toString()).toBe('NotAsked');
    });
  });

  describe('apply', () => {
    it('success function applies to success value', () => {
      const applied = Success((str: string) => parseInt(str, 10)).apply(Success('42'));
      expect(applied.base).toEqual({ tag: 'success', value: 42 });
    });

    it('success function applies to failure', () => {
      const applied = Success((str: string) => parseInt(str, 10)).apply(Failure('error'));
      expect(applied.base).toEqual({ tag: 'failure', error: 'error' });
    });

    it ('cannot apply success not containing a function', () => {
      const applied = Success(0)
        /* @ts-expect-error testing */
        .apply(Success(42));
      expect(applied.base).toEqual({tag: 'success', value: 42 });
    });

    it('cannot apply failure to success value', () => {
      const applied = Failure('error')
      /* @ts-expect-error testing */
        .apply(Success('42'));
      expect(applied.base).toEqual({ tag: 'failure', error: 'error' });
    });

    it('failure value applies to failure', () => {
      const applied = Failure('error').apply(Failure('apply'));
      expect(applied.base).toEqual({ tag: 'failure', error: 'error' });
    });

    it('loading applies to not asked', () => {
      const applied = Loading().apply(NotAsked());
      expect(applied.base).toEqual({ tag: 'loading' });
    });

    it('applies a curried function multiple times to success values', () => {
      const applied = Success((a: number) => (b: number) => (c: number) => a + b + c)
        .apply(Success(1))
        .apply(Success(2))
        .apply(Success(3));
      expect(applied.base).toEqual({ tag: 'success', value: 6 });
    });

    it('applies a curried function multiple times to success and failure values', () => {
      const applied = Success((a: number) => (b: number) => (c: number) => a + b + c)
        .apply(Success(1))
        .apply(Failure('error'))
        .apply(Success(3));
      expect(applied.base).toEqual({ tag: 'failure', error: 'error'  });
    });
  });

  describe('join', () => {
    it('joins nested success values', () => {
      const joined = Success(Success(42)).join();
      expect(joined.base).toEqual({ tag: 'success', value: 42 });
    });

    it('joins nested success and failure values', () => {
      const joined = Success(Failure('error')).join();
      expect(joined.base).toEqual({ tag: 'failure', error: 'error'  });
    });

    it('joins nested success and loading values', () => {
      const joined = Success(Loading()).join();
      expect(joined.base).toEqual({ tag: 'loading'  });
    });

    it('joins nested success and not asked values', () => {
      const joined = Success(NotAsked()).join();
      expect(joined.base).toEqual({ tag: 'not asked'  });
    });

    it('joins nested failure value', () => {
      const joined = Failure('error').join();
      expect(joined.base).toEqual({ tag: 'failure', error: 'error'  });
    });

    it('cannot join single success value', () => {
      const joined = Success(42).join();
      /* @ts-expect-error testing */
      expect(joined.base).toEqual({ tag: 'success', value: 42  });
    });
  });

  describe('fromOptional', () => {
    it('gets success from value', () => {
      const res = RemoteData.fromResult(Maybe.fromOptional(42).toResult('error'));
      expect(res.base).toEqual({ tag: 'success', value: 42 });
    });

    it('gets failure from undefined', () => {
      const res = RemoteData.fromResult(Maybe.fromOptional(undefined).toResult('error'));
      expect(res.base).toEqual({ tag: 'failure', error: 'error'  });
    });

    it('gets success from null', () => {
      const res = RemoteData.fromResult(Maybe.fromOptional(null).toResult('error'));
      expect(res.base).toEqual({ tag: 'success', value: null });
    });
  });

  describe('fromNullable', () => {
    it('gets success from value', () => {
      const res = RemoteData.fromResult(Maybe.fromNullable(42).toResult('error'));
      expect(res.base).toEqual({ tag: 'success', value: 42 });
    });

    it('gets failure from undefined', () => {
      const res = RemoteData.fromResult(Maybe.fromNullable(undefined).toResult('error'));
      expect(res.base).toEqual({ tag: 'failure', error: 'error'  });
    });

    it('gets nothing from null', () => {
      const res = RemoteData.fromResult(Maybe.fromNullable(null).toResult('error'));
      expect(res.base).toEqual({ tag: 'failure', error: 'error'  });
    });
  });

  describe('fromNumber', () => {
    it('gets success from number', () => {
      const res = RemoteData.fromResult(Maybe.fromNumber(42).toResult('error'));
      expect(res.base).toEqual({ tag: 'success', value: 42 });
    });

    it('gets failure from NaN', () => {
      const res = RemoteData.fromResult(Maybe.fromNumber(NaN).toResult('error'));
      expect(res.base).toEqual({ tag: 'failure', error: 'error'  });
    });
  });

  describe('unwrap', () => {
    it('switch case for success', () => {
      const unwrapped = Success(42).base;
      switch (unwrapped.tag) {
      case 'success': {
        expect(unwrapped.value).toBe(42);
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });

    it('switch case for loading', () => {
      const unwrapped =  Loading().base;
      switch (unwrapped.tag) {
      case 'loading': {
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });

    it('switch case for not asked', () => {
      const unwrapped =  NotAsked().base;
      switch (unwrapped.tag) {
      case 'not asked': {
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });

    it('switch case for err', () => {
      const unwrapped = Failure('error').base;
      switch (unwrapped.tag) {
      case 'failure': {
        expect(unwrapped.error).toBe('error');
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });
  });

  describe('record', () => {
    it('gets success from a record of successs', () => {
      expect(RemoteData.record({
        first: Success(1),
        second: Success(2),
        third: Success(3)
      }).base).toEqual({
        tag: 'success',
        value: {
          first: 1,
          second: 2,
          third: 3
        }
      });
    });

    it('gets error from a record with single error', () => {
      expect(RemoteData.record({
        first: Success(1),
        second: Failure('error'),
        third: Success(3)
      }).base).toEqual({
        tag: 'failure' ,
        error: 'error'
      });
    });

    it('gets loading from a record with mixed', () => {
      expect(RemoteData.record({
        first: Loading(),
        second: Failure('error'),
        third: NotAsked()
      }).base).toEqual({
        tag: 'loading'
      });
    });

    it ('gets the error from the first error', () => {
      expect(RemoteData.record({
        first:  Failure('first'),
        second: Failure('second'),
        third: Failure('third')
      }).base).toEqual({
        tag: 'failure' ,
        error: 'first'
      });
    });
  });

  describe('all', () => {
    it('gets success from array of successs', () => {
      expect(RemoteData.all([Success(1), Success(2), Success(3)]).base).toEqual({
        tag: 'success', value: [1, 2, 3]
      });
    });

    it('gets failure from array with single err', () => {
      expect(RemoteData.all([Success(1), Failure('error'), Success(3)]).base).toEqual({
        tag: 'failure' , error: 'error'
      });
    });

    it('gets loading from array with mixed', () => {
      expect(RemoteData.all([Loading(), Failure('error'), NotAsked()]).base).toEqual({
        tag: 'loading'
      });
    });

    it('gets first error from array with multiple errors', () => {
      expect(RemoteData.all([Failure('first'), Failure('second'), Failure('third')]).base).toEqual({
        tag: 'failure' , error: 'first'
      });
    });

    it('gets success from empty array', () => {
      expect(RemoteData.all([]).base).toEqual({
        tag: 'success', value: []
      });
    });

    it('test typings', () => {
      const [num, bool, str] = RemoteData.all([
        Success(42), Success(true), Success('str')
      ]).getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });


  describe('array', () => {
    it('gets success from array of successs', () => {
      expect(RemoteData.array([Success(1), Success(2), Success(3)]).base).toEqual({
        tag: 'success', value: [1, 2, 3]
      });
    });

    it('gets failure from array with single err', () => {
      expect(RemoteData.array([Success(1), Failure('error'), Success(3)]).base).toEqual({
        tag: 'failure' , error: 'error'
      });
    });

    it('gets loading from array with mixed', () => {
      expect(RemoteData.array([Loading(), Failure('error'), NotAsked()]).base).toEqual({
        tag: 'loading'
      });
    });

    it('gets first error from array with multiple errors', () => {
      expect(RemoteData.array([Failure('first'), Failure('second'), Failure('third')]).base).toEqual({
        tag: 'failure' , error: 'first'
      });
    });

    it('gets success from empty array', () => {
      expect(RemoteData.array([]).base).toEqual({
        tag: 'success', value: []
      });
    });

    it('test typings', () => {
      const [num, bool, str] = RemoteData.array([
        Success(42), Success(true), Success('str')
      ]).getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });

  describe('some', () => {
    it('gets first error from array with errors', () => {
      expect(
        RemoteData.some([Failure('first'), Failure('second'), Failure('third')]).base
      ).toEqual({ tag: 'failure' , error: 'first'});
    });

    it('gets success from array with single success', () => {
      expect(
        RemoteData.some([Failure('first'), Success(2), Loading(), NotAsked()]).base
      ).toEqual({ tag: 'success', value: 2 });
    });

    it('gets first success from array with multiple successs', () => {
      expect(
        RemoteData.some([Success(1), Success(2), Success(3)]).base
      ).toEqual({ tag: 'success', value: 1 });
    });
  });

  describe('values', () => {
    it('gets values from array with successs', () => {
      expect(
        RemoteData.values([Success(1), Success(2), Success(3)])
      ).toEqual([1,2,3]);
    });

    it('gets successs from array with mixed', () => {
      expect(
        RemoteData.values([Success(1), Failure('error'), Loading(), NotAsked(), Success(3)])
      ).toEqual([1, 3]);
    });

    it('gets empty array from empty array', () => {
      expect(
        RemoteData.values([])
      ).toEqual([]);
    });
  });

  describe('applyAll', () => {
    it ('applies function to array of successs', () => {
      const applied = RemoteData.applyAll((a, b) => a + b, [Success(42), Success(69)]);
      expect(applied.base).toEqual({tag: 'success', value: 111});
    });

    it ('applies function to array with one err', () => {
      const applied = RemoteData.applyAll((a, b, c, d) => a + b + c + d, [Success(42), Failure('error'), Loading(), NotAsked()]);
      expect(applied.base).toEqual({tag: 'failure', error: 'error' });
    });

    it ('test typings', () => {
      const applied = RemoteData.applyAll(
        (a: number, b: boolean, c: string) => [a,b,c] as const,
        [Success(42), Success(true), Success('str')]);
      const [num, bool, str] = applied.getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });
});