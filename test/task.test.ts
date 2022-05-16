import { Task } from '../task';

jest.useFakeTimers();

const resolveAfter = <A>(resolver: () => A, ms: number): Promise<A> =>
  new Promise((resolve) => setTimeout(() => resolve(resolver()), ms));

const rejectsAfter = <A>(rejector: () => A, ms: number): Promise<never> =>
  new Promise((resolve, reject) => setTimeout(() => reject(rejector()), ms));

describe('Task', () => {
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
      expect(result).toBe(42);
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
      await expect(process).rejects.toBe('error');
      expect(rejector).toHaveBeenCalledTimes(1);
    });
  });

  describe('map', () => {
    it('maps resolving promise', async () => {
      await expect(
        Task.resolve(42)
          .map((n) => n * 2)
          .fork()
      ).resolves.toBe(84);
    });

    it('maps rejecting promise', async () => {
      await expect(
        Task.reject('error')
          .map((n) => n * 2)
          .fork()
      ).rejects.toBe('error');
    });
  });

  describe('chain', () => {
    it('chains resolving promise', async () => {
      await expect(
        Task.resolve(42)
          .chain((n) => Task.resolve(n * 2))
          .fork()
      ).resolves.toBe(84);
    });

    it('chains rejecting promise with resolving promise', async () => {
      await expect(
        Task.reject('first')
          .chain((n) => Task.resolve(n * 2))
          .fork()
      ).rejects.toBe('first');
    });

    it('chains rejecting promise with rejecting promise', async () => {
      await expect(
        Task.reject('first')
          .chain(() => Task.reject('second'))
          .fork()
      ).rejects.toBe('first');
    });

    it('chains resolving promise with rejecting promise', async () => {
      await expect(
        Task.resolve(42)
          .chain(() => Task.reject('second'))
          .fork()
      ).rejects.toBe('second');
    });
  });

  describe('encase', () => {
    it('encases resolving promise', async () => {
      const result = await Task.resolve(42).encase().fork();
      expect(result.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('encases rejecting promise', async () => {
      const result = await Task.reject('error').encase().fork();
      expect(result.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('encases mapped resolving promise', async () => {
      const result = await Task.resolve(42)
        .map((n) => n * 2)
        .encase()
        .fork();
      expect(result.result).toEqual({ tag: 'ok', value: 84 });
    });

    it('encases mapped rejecting promise', async () => {
      const result = await Task.reject('error')
        .map((n) => n * 2)
        .encase()
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('encases chained resolving promise', async () => {
      const result = await Task.resolve(42)
        .chain((n) => Task.resolve(n * 2))
        .encase()
        .fork();
      expect(result.result).toEqual({ tag: 'ok', value: 84 });
    });

    it('encases chained rejecting promise with resolving promise', async () => {
      const result = await Task.reject('first')
        .chain((n) => Task.resolve(n * 2))
        .encase()
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'first' });
    });

    it('encases chained rejecting promise with rejecting promise', async () => {
      const result = await Task.reject('first')
        .chain(() => Task.reject('second'))
        .encase()
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'first' });
    });

    it('encases chained resolving promise with rejecting promise', async () => {
      const result = await Task.resolve(42)
        .chain(() => Task.reject('second'))
        .encase()
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'second' });
    });

    it('maps encased resolving task', async () => {
      const result = await Task.resolve(42)
        .encase()
        .map((r) => r.map((n) => n * 2))
        .fork();
      expect(result.result).toEqual({ tag: 'ok', value: 84 });
    });

    it('maps encased rejecting task', async () => {
      const result = await Task.reject('error')
        .encase()
        .map((r) => r.map((n) => n * 2))
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'error' });
    });

    it('maps error of encased rejecting task', async () => {
      const result = await Task.reject('error')
        .encase()
        .map((r) => r.mapError((str) => str.toUpperCase()))
        .fork();
      expect(result.result).toEqual({ tag: 'err', error: 'ERROR' });
    });

    it('maps error of encased resolving task', async () => {
      const result = await Task.resolve(42)
        .encase()
        .map((r) => r.mapError((str) => str.toUpperCase()))
        .fork();
      expect(result.result).toEqual({ tag: 'ok', value: 42 });
    });

    it('folds encased resolving task', async () => {
      const result = await Task.resolve(42)
        .encase()
        .map((r) =>
          r.fold(
            () => 0,
            (n) => n * 2
          )
        )
        .fork();
      expect(result).toEqual(84);
    });

    it('folds encased rejecting task', async () => {
      const result = await Task.reject('error')
        .encase()
        .map((r) =>
          r.fold(
            () => 0,
            (n) => n * 2
          )
        )
        .fork();
      expect(result).toEqual(0);
    });
  });

  describe('unwrap', () => {
    it('unwraps resolving promise', async () => {
      const task = Task.resolve(42).task;
      await expect(task.fork()).resolves.toBe(42);
    });

    it('unwraps rejecting promise', async () => {
      const task = Task.reject('error').task;
      await expect(task.fork()).rejects.toBe('error');
    });

    it('unwraps mapped resolving promise', async () => {
      const task = Task.resolve(42).map((n) => n * 2).task;
      await expect(task.fork()).resolves.toBe(84);
    });
  });
});
