import Task from '../task';

jest.useFakeTimers();

const resolveAfter = <A>(resolver: () => A, ms: number): Promise<A> =>
  new Promise((resolve) => setTimeout(() => resolve(resolver()), ms));

const rejectsAfter = <A>(rejector: () => A, ms: number): Promise<never> =>
  new Promise((resolve, reject) => setTimeout(() => reject(rejector()), ms));

describe('Task', () => {
  it('tag', () => {
    expect(Task.resolve(42).tag).toBe('task');
  });

  describe('functor laws', () => {
    it('identity', async () => {
      const left = await Task.resolve(42).map((v) => v).fork();
      const right = await Task.resolve(42).fork();
      expect(left.get()).toEqual(right.get());
    });

    it('composition', async () => {
      const f = (v: number) => v * 2;
      const g = (v: number) => v + 2;
      const left = await Task.resolve(42).map(f).map(g).fork();
      const right = await Task.resolve(42).map(v => g(f(v))).fork();
      expect(left.get()).toEqual(right.get());
    });
  });

  describe('applicative laws', () => {
    it('identity', async () => {
      const left = await Task.resolve((v: number) => v).apply(Task.resolve(42)).fork();
      const right = await Task.resolve(42).fork();
      expect(left.get()).toEqual(right.get());
    });

    it('homomorphism', async () => {
      const f = (v: number) => v * 2;
      const left = await Task.resolve(f).apply(Task.resolve(42)).fork();
      const right = await Task.resolve(f(42)).fork();
      expect(left.get()).toEqual(right.get());
    });

    it('interchange', async () => {
      const f = (v: number) => v * 2;
      const left = await Task.resolve(f).apply(Task.resolve(42)).fork();
      const right = await Task.resolve((g: typeof f) => g(42)).apply(Task.resolve(f)).fork();
      expect(left.get()).toEqual(right.get());
    });

    it('composition', async () => {
      const u = Task.resolve((b: boolean) => [b]);
      const v = Task.resolve((a: number) => a > 0);
      const w = Task.resolve(42);
      const compose = (f: (b: boolean) => Array<boolean>) =>
        (g: (a: number) => boolean) =>
          (a: number): Array<boolean> =>
            f(g(a));
      const left = await Task.resolve(compose)
        .apply(u)
        .apply(v)
        .apply(w)
        .fork();
      const right = await u.apply(v.apply(w)).fork();
      expect(left.get()).toEqual(right.get());
    });
  });

  describe('monad laws', () => {
    it('left identity', async () => {
      const ret = <A>(n: A) => Task.resolve(n);
      const f = (n: number) => Task.resolve(n * 2);
      const left = await ret(42).chain(f).fork();
      const right = await f(42).fork();
      expect(left.get()).toEqual(right.get());
    });

    it('right identity',async () => {
      const ret = <A>(n: A) => Task.resolve(n);
      const left = await Task.resolve(42).chain(ret).fork();
      const right = await Task.resolve(42).fork();
      expect(left.get()).toEqual(right.get());
    });

    it('associativity', async() => {
      const m = Task.resolve(42);
      const f = (n: number) => Task.resolve(n + 2);
      const g = (n: number) => Task.resolve(n * 2);
      const left = await m.chain(f).chain(g).fork();
      const right = await  m.chain((v) => f(v).chain(g)).fork();
      expect(left.get()).toEqual(right.get());
    });
  });

  describe('fork', () => {
    it('only runs promise when fork is called', async () => {
      const resolver = jest.fn().mockImplementationOnce(() => 42);
      const init = jest.fn().mockImplementationOnce(() => resolveAfter(resolver, 1000));
      const task = Task<number>(init);
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
      const task = Task<number>(init);
      expect(init).not.toHaveBeenCalled();
      jest.runAllTimers();
      expect(init).not.toHaveBeenCalled();
      const process = task.fork();
      expect(init).toHaveBeenCalledTimes(1);
      expect(rejector).not.toHaveBeenCalled();
      jest.runAllTimers();
      const result = await process;
      expect(result.getError().get()).toBe('error');
      expect(rejector).toHaveBeenCalledTimes(1);
    });
  });

  describe('map', () => {
    it('maps resolving promise', async () => {
      const result = await
      Task.resolve(42)
        .map((n) => n * 2)
        .fork();
      expect(result.get()).toBe(84);
    });

    it('maps rejecting promise', async () => {
      const result = await Task.reject('error')
        .map((n) => n * 2)
        .fork();
      expect(result.getError().get()).toBe('error');
    });
  });

  describe('chain', () => {
    it('chains resolving promise', async () => {
      const result = await Task.resolve(42)
        .chain((n) => Task.resolve(n * 2))
        .fork();
      expect(result.get()).toBe(84);
    });

    it('chains rejecting promise with resolving promise', async () => {
      const result = await Task.reject('first')
        .chain((n) => Task.resolve(n * 2))
        .fork();
      expect(result.getError().get()).toBe('first');
    });

    it('chains rejecting promise with rejecting promise', async () => {
      const result = await Task.reject('first')
        .chain(() => Task.reject('second'))
        .fork();
      expect(result.getError().get()).toBe('first');
    });

    it('chains resolving promise with rejecting promise', async () => {
      const result = await Task.resolve(42)
        .chain(() => Task.reject('second'))
        .fork();
      expect(result.getError().get()).toBe('second');
    });
  });

  describe('encase', () => {
    it('encases resolving promise', async () => {
      const result = await Task.resolve(42).fork();
      expect(result.base).toEqual({ tag: 'ok', value: 42 });
    });

    it('encases rejecting promise', async () => {
      const result = await Task.reject('error').fork();
      expect(result.base).toEqual({ tag: 'err', error: 'error' });
    });

    it('encases mapped resolving promise', async () => {
      const result = await Task.resolve(42)
        .map((n) => n * 2)

        .fork();
      expect(result.base).toEqual({ tag: 'ok', value: 84 });
    });

    it('encases mapped rejecting promise', async () => {
      const result = await Task.reject('error')
        .map((n) => n * 2)

        .fork();
      expect(result.base).toEqual({ tag: 'err', error: 'error' });
    });

    it('encases chained resolving promise', async () => {
      const result = await Task.resolve(42)
        .chain((n) => Task.resolve(n * 2))

        .fork();
      expect(result.base).toEqual({ tag: 'ok', value: 84 });
    });

    it('encases chained rejecting promise with resolving promise', async () => {
      const result = await Task.reject('first')
        .chain((n) => Task.resolve(n * 2))

        .fork();
      expect(result.base).toEqual({ tag: 'err', error: 'first' });
    });

    it('encases chained rejecting promise with rejecting promise', async () => {
      const result = await Task.reject('first')
        .chain(() => Task.reject('second'))

        .fork();
      expect(result.base).toEqual({ tag: 'err', error: 'first' });
    });

    it('encases chained resolving promise with rejecting promise', async () => {
      const result = await Task.resolve(42)
        .chain(() => Task.reject('second'))

        .fork();
      expect(result.base).toEqual({ tag: 'err', error: 'second' });
    });

    it('maps encased resolving task', async () => {
      const result = await Task.resolve(42)

        .map(n => n * 2)
        .fork();
      expect(result.base).toEqual({ tag: 'ok', value: 84 });
    });

    it('maps encased rejecting task', async () => {
      const result = await Task.reject('error')

        .map((n: number) => n * 2)
        .fork();
      expect(result.base).toEqual({ tag: 'err', error: 'error' });
    });

    it('maps error of encased rejecting task', async () => {
      const result = await Task.reject('error')

        .mapError((str) => str.toUpperCase())
        .fork();
      expect(result.base).toEqual({ tag: 'err', error: 'ERROR' });
    });

    it('maps error of encased resolving task', async () => {
      const result = await Task.resolve(42)
        .mapError(str => str.toUpperCase())
        .fork();
      expect(result.base).toEqual({ tag: 'ok', value: 42 });
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
      const result = await Task.resolve(42).fork();
      expect(result.get()).toBe(42);
    });

    it('unwraps rejecting promise', async () => {
      const result = await Task.reject('error').fork();
      expect(result.getError().get()).toBe('error');
    });

    it('unwraps mapped resolving promise', async () => {
      const result = await Task.resolve(42).map((n) => n * 2).fork();
      expect(result.get()).toBe(84);
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
      expect(result.get()).toEqual({
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
      expect(result.getError().get()).toBe('error');
    });

    it('rejects with the error from first rejecting task', async () => {
      const task = Task.record({
        first: Task.reject('first'),
        second: Task.reject('second'),
        third: Task.resolve('third'),
      });
      const result = await task.fork();
      expect(result.getError().get()).toBe('first');
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
      expect(result.get()).toEqual(
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
      expect(result.getError().get()).toEqual(
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
      expect(result.getError().get()).toEqual(
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
      const result = await Task.resolve(Task.resolve(42))
        .join()
        .fork();
      expect(result.get()).toBe(42);
    });

    it('joins resolving task with rejecting task', async () => {
      const result = await Task.resolve(Task.reject('error'))
        .join()
        .fork();
      expect(result.getError().get()).toBe('error');
    });

    it('joins rejecting task', async () => {
      const result = await Task.reject('error')
        .join()
        .fork();
      expect(result.getError().get()).toBe('error');
    });

    it('cannot join single resolving task', async () => {
      const result = await Task.resolve(42)
        .join()
        /* @ts-expect-error testing */
        .fork();
      expect(result.get()).toBe(42);
    });

    it('works with chain', async () => {
      const result = await Task.resolve(Task.resolve(42)).chain(t => t).fork();
      expect(result.get()).toBe(42);
    });
  });

  describe('apply', () => {
    it('function applies to resolving task', async () => {
      const result = await Task.resolve((str: string) => parseInt(str, 10)).apply(Task.resolve('42')).fork();
      expect(result.get()).toEqual(42);
    });

    it('function applies to rejecting task', async () => {
      const result = await Task.resolve((str: string) => parseInt(str, 10)).apply(Task.reject('error')).fork();
      expect(result.getError().get()).toEqual('error');
    });

    it ('cannot apply task not containing a function', async () => {
      const result = await Task.resolve(0)
        /* @ts-expect-error testing */
        .apply(Task.resolve(42)).fork();
      expect(result.get()).toEqual(42);
    });

    it('cannot apply rejecting task to resolving task', async () => {
      const result = await Task.reject('error')
        /* @ts-expect-error testing */
        .apply(Task.resolve('42')).fork();
      expect(result.getError().get()).toEqual('error');
    });

    it('rejecting task applies to rejecting task', async () => {
      const result = await Task.reject('first').apply(Task.reject('second')).fork();
      expect(result.getError().get()).toEqual('first');
    });

    it('applies a curried function multiple times to resolving values', async () => {
      const applied = await Task.resolve((a: number) => (b: number) => (c: number) => a + b * c)
        .apply(Task.resolve(1))
        .apply(Task.resolve(2))
        .apply(Task.resolve(3))
        .fork();
      expect(applied.get()).toEqual(7);
    });

    it('applies a curried function multiple times to resolving and rejecting values', async () => {
      const applied = await Task.resolve((a: number) => (b: number) => (c: number) => a + b + c)
        .apply(Task.resolve(1))
        .apply(Task.reject('error'))
        .apply(Task.resolve(3))
        .fork();
      expect(applied.getError().get()).toEqual('error');
    });

    it('autocurries function', async () => {
      const applied = await Task.resolve((a: number, b: number, c: number) => a + b * c)
        .apply(Task.resolve(1))
        .apply(Task.resolve(2))
        .apply(Task.resolve(3))
        .fork();
      expect(applied.get()).toEqual(7);
    });
  });

  describe('applyAll', () => {
    it ('applies function to array of resolving tasks', async () => {
      const result = await Task.applyAll((a, b) => a + b, [Task.resolve(42), Task.resolve(69)]).fork();
      expect(result.get()).toEqual(111);
    });

    it ('applies function to array with one rejecting task', async () => {
      const result = await Task.applyAll((a, b) => a + b, [Task.resolve(42), Task.reject('error')]).fork();
      expect(result.getError().get()).toEqual('error');
    });

    it ('test typings', async () => {
      const result = await Task.applyAll(
        (a: number, b: boolean, c: string) => [a,b,c] as const,
        [Task.resolve(42), Task.resolve(true), Task.resolve('str')])
        .fork();
      const [num, bool, str] = result.getOrElse([0, false, '']);
      expect([num, bool, str]).toEqual([42, true, 'str']);
    });
  });

  describe('sleep', () => {
    it('sleeps for one second and resolves with nothing', async () => {
      const promise = Task.sleep(1000).fork();
      jest.advanceTimersByTime(1000);
      const result = await promise;
      expect(result.tag).toBe('ok');
    });

    it('map to resolve with value', async () => {
      const promise = Task.sleep(1000).map(() => 42).fork();
      jest.advanceTimersByTime(1000);
      const result = await promise;
      expect(result.get()).toBe(42);
    });

    it('chain to reject with error', async () => {
      const promise = Task.sleep(1000).chain(() => Task.reject('error')).fork();
      jest.advanceTimersByTime(1000);
      const result = await promise;
      expect(result.getError().get()).toBe('error');
    });
  });
});
