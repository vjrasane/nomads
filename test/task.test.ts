import { Task } from '../task';

jest.useFakeTimers();

const resolveAfter = <A>(resolver: () => A, ms: number): Promise<A> =>
  new Promise((resolve) => setTimeout(() => resolve(resolver()), ms));

const rejectsAfter = <A>(rejector: () => A, ms: number): Promise<never> =>
  new Promise((resolve, reject) => setTimeout(() => reject(rejector()), ms));

describe('Task', () => {
  it('tag', () => {
    expect(Task.resolve(42).tag).toBe('task');
  });

  describe('fork', () => {
    it('only runs promise when fork is called', async () => {
      const resolver = jest.fn().mockImplementationOnce(() => 42);
      const init = jest.fn().mockImplementationOnce(() => resolveAfter(resolver, 1000));
      const task = Task.of<number>(init);
      expect(init).not.toHaveBeenCalled();
      jest.runAllTimers();
      expect(init).not.toHaveBeenCalled();
      const process = task.fork();
      expect(init).toHaveBeenCalledTimes(1);
      expect(resolver).not.toHaveBeenCalled();
      jest.runAllTimers();
      const result = await process;
      expect(resolver).toHaveBeenCalledTimes(1);
      expect(result.get()).toBe(42);
    });

    it('rejects with error if thrown', async () => {
      const rejector = jest.fn().mockImplementationOnce(() => 'error');
      const init = jest.fn().mockImplementationOnce(() => rejectsAfter(rejector, 1000));
      const task = Task.of<number>(init);
      expect(init).not.toHaveBeenCalled();
      jest.runAllTimers();
      expect(init).not.toHaveBeenCalled();
      const process = task.fork();
      expect(init).toHaveBeenCalledTimes(1);
      expect(rejector).not.toHaveBeenCalled();
      jest.runAllTimers();
      const result = await process;
      expect(result.error).toBe('error');
      expect(rejector).toHaveBeenCalledTimes(1);
    });
  });

  describe('map', () => {
    it('maps resolving promise', async () => {
      const result = await
      Task.resolve(42)
        .map((n) => n * 2)
        .fork();
      expect(result.value).toBe(84);
    });

    it('maps rejecting promise', async () => {
      const result = await Task.reject('error')
        .map((n) => n * 2)
        .fork();
      expect(result.error).toBe('error');
    });
  });

  describe('chain', () => {
    it('chains resolving promise', async () => {
      const result = await Task.resolve(42)
        .chain((n) => Task.resolve(n * 2))
        .fork();
      expect(result.value).toBe(84);
    });

    it('chains rejecting promise with resolving promise', async () => {
      const result = await Task.reject('first')
        .chain((n) => Task.resolve(n * 2))
        .fork();
      expect(result.error).toBe('first');
    });

    it('chains rejecting promise with rejecting promise', async () => {
      const result = await Task.reject('first')
        .chain(() => Task.reject('second'))
        .fork();
      expect(result.error).toBe('first');
    });

    it('chains resolving promise with rejecting promise', async () => {
      const result = await Task.resolve(42)
        .chain(() => Task.reject('second'))
        .fork();
      expect(result.error).toBe('second');
    });
  });

  describe('encase', () => {
    it('encases resolving promise', async () => {
      const result = await Task.resolve(42).fork();
      expect(result.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('encases rejecting promise', async () => {
      const result = await Task.reject('error').fork();
      expect(result.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('encases mapped resolving promise', async () => {
      const result = await Task.resolve(42)
        .map((n) => n * 2)
        
        .fork();
      expect(result.result).toEqual({ tag: 'ok', value: 84 });
    });

    it('encases mapped rejecting promise', async () => {
      const result = await Task.reject('error')
        .map((n) => n * 2)
        
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('encases chained resolving promise', async () => {
      const result = await Task.resolve(42)
        .chain((n) => Task.resolve(n * 2))
        
        .fork();
      expect(result.result).toEqual({ tag: 'ok', value: 84 });
    });

    it('encases chained rejecting promise with resolving promise', async () => {
      const result = await Task.reject('first')
        .chain((n) => Task.resolve(n * 2))
        
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'first' });
    });

    it('encases chained rejecting promise with rejecting promise', async () => {
      const result = await Task.reject('first')
        .chain(() => Task.reject('second'))
        
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'first' });
    });

    it('encases chained resolving promise with rejecting promise', async () => {
      const result = await Task.resolve(42)
        .chain(() => Task.reject('second'))
        
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'second' });
    });

    it('maps encased resolving task', async () => {
      const result = await Task.resolve(42)
        
        .map(n => n * 2)
        .fork();
      expect(result.result).toEqual({ tag: 'ok', value: 84 });
    });

    it('maps encased rejecting task', async () => {
      const result = await Task.reject('error')
        
        .map((n: number) => n * 2)
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('maps error of encased rejecting task', async () => {
      const result = await Task.reject('error')
        
        .mapError((str) => str.toUpperCase())
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'ERROR' });
    });

    it('maps error of encased resolving task', async () => {
      const result = await Task.resolve(42)
        .mapError(str => str.toUpperCase())
        .fork();
      expect(result.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('folds encased resolving task', async () => {
      const result = await Task.resolve(42).fork();
      expect(
        result.fold({ 
          err: () => 0,
          ok: (n) => n * 2
        })).toEqual(84);
    });

    it('folds encased rejecting task', async () => {
      const result = await Task.reject('error').fork();
      expect(result.fold({
        err: () => 0,
        ok: (n: number) => n * 2
      })).toEqual(0);
    });
  });

  describe('unwrap', () => {
    it('unwraps resolving promise', async () => {
      const result = await Task.resolve(42).task();
      expect(result.value).toBe(42);
    });

    it('unwraps rejecting promise', async () => {
      const result = await Task.reject('error').task();
      expect(result.error).toBe('error');
    });

    it('unwraps mapped resolving promise', async () => {
      const result = await Task.resolve(42).map((n) => n * 2).task();
      expect(result.value).toBe(84);
    });
  });

  describe('record', () => {
    it('gets resolving task from record of resolving tasks', async () => {
      const task = Task.record({
        first: Task.resolve(1),
        second: Task.resolve(2),
        third: Task.resolve(3),
      });
      const result = await task.fork();
      expect(result.value).toEqual({
        first: 1, second: 2, third: 3
      });
    });

    it('gets rejecting task from record with single rejecting task', async () => {
      const task = Task.record({
        first: Task.resolve(1),
        second: Task.reject('error'),
        third: Task.resolve(3),
      });
      const result = await task.fork();
      expect(result.error).toBe('error');
    });

    it('rejects with the error from first rejecting task', async () => {
      const task = Task.record({
        first: Task.reject('first'),
        second: Task.reject('second'),
        third: Task.resolve('third'),
      });
      const result = await task.fork();
      expect(result.error).toBe('first');
    });

    it ('test typings', async () => {
      const result = await Task.record({
        num: Task.resolve(42),
        bool: Task.resolve(true),
        str: Task.resolve('str'),
      }).fork();
      const {num, bool, str }= result.getOrElse({ num: 0, bool: false, str: '' });
      expect({ num, bool, str }).toEqual({ num: 42,bool: true,str: 'str'});
    });
  });

  describe('array', () => {
    it ('gets resolving task from array of resolving tasks', async () => {
      const task = Task.array([
        Task.resolve(1),
        Task.resolve(2),
        Task.resolve(3)
      ]);
      const result = await task.fork();
      expect(result.value).toEqual(
        [1 ,2 ,3]
      );
    });

    it ('gets rejecting task from array with one rejecting task', async () => {
      const task = Task.array([
        Task.resolve(1),
        Task.reject('error'),
        Task.resolve(3)
      ]);
      const result = await task.fork();
      expect(result.error).toEqual(
        'error'
      );
    });

    it ('rejects with error from first rejecting task', async () => {
      const task = Task.array([
        Task.reject('first'),
        Task.reject('second'),
        Task.reject('third')
      ]);
      const result = await task.fork();
      expect(result.error).toEqual(
        'first'
      );
    });

    it ('test typings', async () => {
      const result = await Task.array([
        Task.resolve(42),
        Task.resolve(true),
        Task.resolve('str'),
      ]).fork();
      const [num, bool, str] = result.getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });

  describe('join', () => {
    it('joins two resolving tasks', async () => {
      const result = await Task.join(
        Task.resolve(Task.resolve(42))
      ).fork();
      expect(result.value).toBe(42);
    });

    it('joins resolving task with rejecting task', async () => {
      const result = await Task.join(
        Task.resolve(Task.reject('error'))
      ).fork();
      expect(result.error).toBe('error');
    });

    it('works with chain', async () => {
      const result = await Task.resolve(Task.resolve(42)).chain(t => t).fork();
      expect(result.value).toBe(42);
    });
  });
});
