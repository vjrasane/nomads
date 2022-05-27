import { Maybe } from '../maybe';
import { Failure, Loading, RemoteData, StandBy, Success } from '../remote-data';


describe('RemoteData', () => {
  it('Success', () => {
    const success = Success(42);
    expect(success.remoteData).toEqual({ tag: 'success', data: 42 });
    expect(success.data).toBe(42);
    expect(success.error).toBe(undefined);
    expect(success.tag).toBe('success');
    expect(success.get()).toBe(42);
    expect(success.getError().get()).toBe(undefined);
    expect(success.getData().get()).toBe(42);
  });
	
  it('Failure', () => {
    const fail = Failure('error');
    expect(fail.remoteData).toEqual({ tag: 'failure', error: 'error' });
    expect(fail.data).toBe(undefined);
    expect(fail.error).toBe('error');
    expect(fail.tag).toBe('failure');
    expect(fail.get()).toBe(undefined);
    expect(fail.getError().get()).toBe('error');
    expect(fail.getData().get()).toBe(undefined);
  });

  it('Loading', () => {
    expect(Loading.remoteData).toEqual({ tag: 'loading' });
    expect(Loading.data).toBe(undefined);
    expect(Loading.error).toBe(undefined);
    expect(Loading.tag).toBe('loading');
    expect(Loading.get()).toBe(undefined);
    expect(Loading.getError().get()).toBe(undefined);
    expect(Loading.getData().get()).toBe(undefined);
  });

  it('StandBy', () => {
    expect(StandBy.remoteData).toEqual({ tag: 'stand by' });
    expect(StandBy.data).toBe(undefined);
    expect(StandBy.error).toBe(undefined);
    expect(StandBy.tag).toBe('stand by');
    expect(StandBy.get()).toBe(undefined);
    expect(StandBy.getError().get()).toBe(undefined);
    expect(StandBy.getData().get()).toBe(undefined);
  });

  describe('map', () => {
    it('maps success value', () => {
      const mapped = Success(42).map((num) => num * 2);
      expect(mapped.remoteData).toEqual({ tag: 'success', data: 84 });
    });
  
    it('maps failure value', () => {
      const mapped = Failure('error').map((num) => num * 2);
      expect(mapped.remoteData).toEqual({ tag: 'failure', error: 'error' });
    });

    it('maps loading value', () => {
      const mapped = Loading.map((num) => num * 2);
      expect(mapped.remoteData).toEqual({ tag: 'loading' });
    });

    it('maps stand by value', () => {
      const mapped = StandBy.map((num) => num * 2);
      expect(mapped.remoteData).toEqual({ tag: 'stand by' });
    });
  });

  describe('mapError', () => {
    it('maps success value', () => {
      const mapped = Success(42).mapError((str) => str.toUpperCase());
      expect(mapped.remoteData).toEqual({ tag: 'success', data: 42 });
    });
  
    it('maps failure value', () => {
      const mapped = Failure('error').mapError((str) => str.toUpperCase());
      expect(mapped.remoteData).toEqual({ tag: 'failure', error: 'ERROR' });
    });

    it('maps loading value', () => {
      const mapped = Loading.mapError((str) => str.toUpperCase());
      expect(mapped.remoteData).toEqual({ tag: 'loading' });
    });

    it('maps stand by value', () => {
      const mapped = StandBy.mapError((str) => str.toUpperCase());
      expect(mapped.remoteData).toEqual({ tag: 'stand by' });
    });
  });

  describe('chain', () => {
    it('chains success value', () => {
      const mapped = Success(42).chain((num) => Success(num * 2));
      expect(mapped.remoteData).toEqual({ tag: 'success', data: 84 });
    });
  
    it('chains failure value', () => {
      const mapped = Failure('error').chain((num) => Success(num * 2));
      expect(mapped.remoteData).toEqual({ tag: 'failure', error: 'error' });
    });

    it('chains loading value', () => {
      const mapped = Loading.chain((num) => Success(num * 2));
      expect(mapped.remoteData).toEqual({ tag: 'loading' });
    });

    it('chains stand by value', () => {
      const mapped = StandBy.chain((num) => Success(num * 2));
      expect(mapped.remoteData).toEqual({ tag: 'stand by' });
    });
  });


  describe('or', () => {
    it('success or success returns success', () => {
      const or = Success(42).or(Success(0));
      expect(or.remoteData).toEqual({ tag: 'success', data: 42 });
    });

    it('success or failure returns success', () => {
      const or = Success(42).or(Failure('error'));
      expect(or.remoteData).toEqual({ tag: 'success', data: 42 });
    });

    it('failure or success returns success', () => {
      const or = Failure('error').or(Success(42));
      expect(or.remoteData).toEqual({ tag: 'success', data: 42 });
    });

    it('failure or failure returns failure', () => {
      const or = Failure('first').or(Failure('second'));
      expect(or.remoteData).toEqual({ tag: 'failure', error: 'first' });
    });

    it('loading or stand by returns loading', () => {
      const or = Loading.or(StandBy);
      expect(or.remoteData).toEqual({ tag: 'loading' });
    });
  });

  describe('orElse', () => {
    it('success or success returns success', () => {
      const or = Success(42).orElse(Success(0));
      expect(or.remoteData).toEqual({ tag: 'success', data: 0 });
    });

    it('success or failure returns success', () => {
      const or = Success(42).orElse(Failure('error'));
      expect(or.remoteData).toEqual({ tag: 'success', data: 42 });
    });

    it('failure or success returns success', () => {
      const or = Failure('error').orElse(Success(42));
      expect(or.remoteData).toEqual({ tag: 'success', data: 42 });
    });

    it('failure or failure returns failure', () => {
      const or = Failure('first').orElse(Failure('second'));
      expect(or.remoteData).toEqual({ tag: 'failure', error: 'second' });
    });

    it('loading or stand by returns stand by', () => {
      const or = Loading.orElse(StandBy);
      expect(or.remoteData).toEqual({ tag: 'stand by' });
    });
  });


  describe('default', () => {
    it('success defaults to itself', () => {
      const def = Success(42).default(0);
      expect(def.remoteData).toEqual({ tag: 'success', data: 42 });
    });

    it('failure defaults to default', () => {
      const def = Failure('error').default(0);
      expect(def.remoteData).toEqual({ tag: 'success', data: 0 });
    });

    it('loading defaults to default', () => {
      const def = Loading.default(0);
      expect(def.remoteData).toEqual({ tag: 'success', data: 0 });
    });

    it('stand by defaults to default', () => {
      const def = StandBy.default(0);
      expect(def.remoteData).toEqual({ tag: 'success', data: 0 });
    });

    it('failure defaults to first default', () => {
      const def = Failure('error').default(0).default(-1);
      expect(def.remoteData).toEqual({ tag: 'success', data: 0 });
    });
  });

  describe('fold', () => {
    it('folds success value', () => {
      const folded = Success(42).fold({
        failure: () => 69,
        loading: () => 69,
        'stand by': () => 69,
        success: (num) => num / 2
      });
      expect(folded).toBe(21);
    });

    it('folds failure value', () => {
      const folded = Failure('error').fold({
        failure: (err) => err.toUpperCase(),
        loading: () => 'str',
        'stand by': () => 'str',
        success: () => 'str'
      });
      expect(folded).toBe('ERROR');
    });

    it('folds loading value', () => {
      const folded = Loading.fold({
        failure: (err) => err.toUpperCase(),
        loading: () => 'loading',
        'stand by': () => 'str',
        success: () => 'str'
      });
      expect(folded).toBe('loading');
    });

    it('folds stand by value', () => {
      const folded = StandBy.fold({
        failure: (err) => err.toUpperCase(),
        loading: () => 'str',
        'stand by': () => 'stand by',
        success: () => 'str'
      });
      expect(folded).toBe('stand by');
    });
  });

  describe('toMaybe', () => {
    it('gets just from success value', () => {
      const maybe = Success(42).toMaybe();
      expect(maybe.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('gets nothing from failure value', () => {
      const maybe = Failure('error').toMaybe();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from loading value', () => {
      const maybe = Loading.toMaybe();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from stand by value', () => {
      const maybe = StandBy.toMaybe();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
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
      expect(Loading.getOrElse(0)).toBe(0);
    });

    it('gets value from stand by', () => {
      expect(StandBy.getOrElse(0)).toBe(0);
    });

    it('gets value from null success', () => {
      expect(Success<number | null>(null).getOrElse(0)).toBe(null);
      expect(Success<number | undefined>(undefined).getOrElse(0)).toBe(undefined);
    });
  });

  describe('getData', () => {
    it('gets just from success value', () => {
      const maybe = Success(42).getData();
      expect(maybe.maybe).toEqual({ tag: 'just', value: 42 });
    });

    it('gets nothing from loading value', () => {
      const maybe = Loading.getData();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from stand by value', () => {
      const maybe = StandBy.getData();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from failure value', () => {
      const maybe = Failure('error').getData();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });
  });

  describe('getError', () => {
    it('gets nohting from success value', () => {
      const maybe = Success(42).getError();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from loading value', () => {
      const maybe = Loading.getError();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets nothing from stand by value', () => {
      const maybe = StandBy.getError();
      expect(maybe.maybe).toEqual({ tag: 'nothing' });
    });

    it('gets just from failure value', () => {
      const maybe = Failure('error').getError();
      expect(maybe.maybe).toEqual({ tag: 'just', value: 'error' });
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
      expect(Loading.toString()).toBe('Loading');
    });

    it('prints stand by value', () => {
      expect(StandBy.toString()).toBe('StandBy');
    });
  });

  describe('applyTo', () => {
    it('success function applies to success value', () => {
      const applied = Success((str: string) => parseInt(str, 10)).chain(RemoteData.applyTo(Success('42')));
      expect(applied.remoteData).toEqual({ tag: 'success', data: 42 });
    });

    it('success function applies to failure', () => {
      const applied = Success((str: string) => parseInt(str, 10)).chain(RemoteData.applyTo(Failure('error')));
      expect(applied.remoteData).toEqual({ tag: 'failure', error: 'error' });
    });

    it('failure applies to success value', () => {
      const applied = Failure('error').chain(RemoteData.applyTo(Success('42')));
      expect(applied.remoteData).toEqual({ tag: 'failure', error: 'error' });
    });

    it('failure value applies to failure', () => {
      const applied = Failure('error').chain(RemoteData.applyTo(Failure('apply')));
      expect(applied.remoteData).toEqual({ tag: 'failure', error: 'error' });
    });

    it('loading applies to stand by', () => {
      const applied = Loading.chain(RemoteData.applyTo(StandBy));
      expect(applied.remoteData).toEqual({ tag: 'loading' });
    });

    it('applies a curried function multiple times to success values', () => {
      const applied = Success((a: number) => (b: number) => (c: number) => a + b + c)
        .chain(RemoteData.applyTo(Success(1)))
        .chain(RemoteData.applyTo(Success(2)))
        .chain(RemoteData.applyTo(Success(3)));
      expect(applied.remoteData).toEqual({ tag: 'success', data: 6 });
    });

    it('applies a curried function multiple times to success and failure values', () => {
      const applied = Success((a: number) => (b: number) => (c: number) => a + b + c)
        .chain(RemoteData.applyTo(Success(1)))
        .chain(RemoteData.applyTo(Failure('error')))
        .chain(RemoteData.applyTo(Success(3)));
      expect(applied.remoteData).toEqual({ tag: 'failure', error: 'error'  });
    });
  });

  describe('join', () => {
    it('joins nested success values', () => {
      const joined = RemoteData.join(Success(Success(42)));
      expect(joined.remoteData).toEqual({ tag: 'success', data: 42 });
    });

    it('joins nested success and failure values', () => {
      const joined = RemoteData.join(Success(Failure('error')));
      expect(joined.remoteData).toEqual({ tag: 'failure', error: 'error'  });
    });

    it('joins nested success and loading values', () => {
      const joined = RemoteData.join(Success(Loading));
      expect(joined.remoteData).toEqual({ tag: 'loading'  });
    });

    it('joins nested success and stand by values', () => {
      const joined = RemoteData.join(Success(StandBy));
      expect(joined.remoteData).toEqual({ tag: 'stand by'  });
    });

    it('joins nested failure value', () => {
      const joined = RemoteData.join(Failure('error'));
      expect(joined.remoteData).toEqual({ tag: 'failure', error: 'error'  });
    });
  });

  describe('fromOptional', () => {
    it('gets success from value', () => {
      const res = RemoteData.fromResult(Maybe.fromOptional(42).toResult('error'));
      expect(res.remoteData).toEqual({ tag: 'success', data: 42 });
    });

    it('gets failure from undefined', () => {
      const res = RemoteData.fromResult(Maybe.fromOptional(undefined).toResult('error'));
      expect(res.remoteData).toEqual({ tag: 'failure', error: 'error'  });
    });

    it('gets success from null', () => {
      const res = RemoteData.fromResult(Maybe.fromOptional(null).toResult('error'));
      expect(res.remoteData).toEqual({ tag: 'success', data: null });
    });
  });

  describe('fromNullable', () => {
    it('gets success from value', () => {
      const res = RemoteData.fromResult(Maybe.fromNullable(42).toResult('error'));
      expect(res.remoteData).toEqual({ tag: 'success', data: 42 });
    });

    it('gets failure from undefined', () => {
      const res = RemoteData.fromResult(Maybe.fromNullable(undefined).toResult('error'));
      expect(res.remoteData).toEqual({ tag: 'failure', error: 'error'  });
    });

    it('gets nothing from null', () => {
      const res = RemoteData.fromResult(Maybe.fromNullable(null).toResult('error'));
      expect(res.remoteData).toEqual({ tag: 'failure', error: 'error'  });
    });
  });

  describe('fromNumber', () => {
    it('gets success from number', () => {
      const res = RemoteData.fromResult(Maybe.fromNumber(42).toResult('error'));
      expect(res.remoteData).toEqual({ tag: 'success', data: 42 });
    });

    it('gets failure from NaN', () => {
      const res = RemoteData.fromResult(Maybe.fromNumber(NaN).toResult('error'));
      expect(res.remoteData).toEqual({ tag: 'failure', error: 'error'  });
    });
  });

  describe('unwrap', () => {
    it('switch case for success', () => {
      const unwrapped = Success(42).remoteData;
      switch (unwrapped.tag) {
      case 'success': {
        expect(unwrapped.data).toBe(42);
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });

    it('switch case for loading', () => {
      const unwrapped =  Loading.remoteData;
      switch (unwrapped.tag) {
      case 'loading': {
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });

    it('switch case for stand by', () => {
      const unwrapped =  StandBy.remoteData;
      switch (unwrapped.tag) {
      case 'stand by': {
        break;
      }
      default:
        fail('should never enter the default case');
      }
    });

    it('switch case for err', () => {
      const unwrapped = Failure('error').remoteData;
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
      }).remoteData).toEqual({
        tag: 'success',
        data: {
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
      }).remoteData).toEqual({
        tag: 'failure' ,
        error: 'error'
      });
    });

    it('gets loading from a record with mixed', () => {
      expect(RemoteData.record({
        first: Loading,
        second: Failure('error'),
        third: StandBy
      }).remoteData).toEqual({
        tag: 'loading'
      });
    });

    it ('gets the error from the first error', () => {
      expect(RemoteData.record({
        first:  Failure('first'),
        second: Failure('second'),
        third: Failure('third')
      }).remoteData).toEqual({
        tag: 'failure' ,
        error: 'first'
      });
    });
  });

  describe('all', () => {
    it('gets success from array of successs', () => {
      expect(RemoteData.all([Success(1), Success(2), Success(3)]).remoteData).toEqual({
        tag: 'success', data: [1, 2, 3]
      });
    });

    it('gets failure from array with single err', () => {
      expect(RemoteData.all([Success(1), Failure('error'), Success(3)]).remoteData).toEqual({
        tag: 'failure' , error: 'error'
      });
    });

    it('gets loading from array with mixed', () => {
      expect(RemoteData.all([Loading, Failure('error'), StandBy]).remoteData).toEqual({
        tag: 'loading'
      });
    });

    it('gets first error from array with multiple errors', () => {
      expect(RemoteData.all([Failure('first'), Failure('second'), Failure('third')]).remoteData).toEqual({
        tag: 'failure' , error: 'first'
      });
    });

    it('gets success from empty array', () => {
      expect(RemoteData.all([]).remoteData).toEqual({
        tag: 'success', data: []
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
      expect(RemoteData.array([Success(1), Success(2), Success(3)]).remoteData).toEqual({
        tag: 'success', data: [1, 2, 3]
      });
    });

    it('gets failure from array with single err', () => {
      expect(RemoteData.array([Success(1), Failure('error'), Success(3)]).remoteData).toEqual({
        tag: 'failure' , error: 'error'
      });
    });

    it('gets loading from array with mixed', () => {
      expect(RemoteData.array([Loading, Failure('error'), StandBy]).remoteData).toEqual({
        tag: 'loading'
      });
    });

    it('gets first error from array with multiple errors', () => {
      expect(RemoteData.array([Failure('first'), Failure('second'), Failure('third')]).remoteData).toEqual({
        tag: 'failure' , error: 'first'
      });
    });

    it('gets success from empty array', () => {
      expect(RemoteData.array([]).remoteData).toEqual({
        tag: 'success', data: []
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
        RemoteData.some([Failure('first'), Failure('second'), Failure('third')]).remoteData
      ).toEqual({ tag: 'failure' , error: 'first'});
    });

    it('gets success from array with single success', () => {
      expect(
        RemoteData.some([Failure('first'), Success(2), Loading, StandBy]).remoteData
      ).toEqual({ tag: 'success', data: 2 });
    });

    it('gets first success from array with multiple successs', () => {
      expect(
        RemoteData.some([Success(1), Success(2), Success(3)]).remoteData
      ).toEqual({ tag: 'success', data: 1 });
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
        RemoteData.values([Success(1), Failure('error'), Loading, StandBy, Success(3)])
      ).toEqual([1, 3]);
    });

    it('gets empty array from empty array', () => {
      expect(
        RemoteData.values([])
      ).toEqual([]);
    });
  });

  describe('apply', () => {
    it ('applies function to array of successs', () => {
      const applied = RemoteData.apply((a, b) => a + b, [Success(42), Success(69)]);
      expect(applied.remoteData).toEqual({tag: 'success', data: 111});
    });

    it ('applies function to array with one err', () => {
      const applied = RemoteData.apply((a, b, c, d) => a + b + c + d, [Success(42), Failure('error'), Loading, StandBy]);
      expect(applied.remoteData).toEqual({tag: 'failure', error: 'error' });
    });

    it ('test typings', () => {
      const applied = RemoteData.apply(
        (a: number, b: boolean, c: string) => [a,b,c] as const, 
        [Success(42), Success(true), Success('str')]);
      const [num, bool, str] = applied.getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });
});