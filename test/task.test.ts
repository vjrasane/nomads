// import { resolve, reject, Task } from "../src/monads/task";


// jest.useFakeTimers();

// const resolveAfter = <A>(resolver: () => A, ms: number): Promise<A> => new Promise(
// 	resolve => setTimeout(() => resolve(resolver()), ms)
// )

// const rejectsAfter = <A>(rejector: () => A, ms: number): Promise<never> => new Promise(
// 	(resolve, reject) => setTimeout(() => reject(rejector()), ms)
// )

// describe("Task", () => {
// 	describe("fork", () => {
// 		it("only runs promise when fork is called", async () => {
// 			const resolver = jest.fn().mockImplementationOnce(
// 				() => 42
// 			)
// 			const init = jest.fn().mockImplementationOnce(
// 				() => resolveAfter(resolver, 1000)
// 			);
// 			const task = Task(init);
// 			expect(init).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			expect(init).not.toHaveBeenCalled();
// 			const process = task.fork();
// 			expect(init).toHaveBeenCalledTimes(1);
// 			expect(resolver).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			const result = await process;
// 			expect(resolver).toHaveBeenCalledTimes(1);
// 			expect(result.get()).toBe(42);
// 		});

// 		it("rejects with error if thrown", async () => {
// 			const rejector = jest.fn().mockImplementationOnce(
// 				() => "error"
// 			)
// 			const init = jest.fn().mockImplementationOnce(
// 				() => rejectsAfter(rejector, 1000)
// 			);
// 			const task = Task(init);
// 			expect(init).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			expect(init).not.toHaveBeenCalled();
// 			const process = task.fork();
// 			expect(init).toHaveBeenCalledTimes(1);
// 			expect(rejector).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			const result = await process;
// 			expect(result.getError().get()).toBe("error");
// 			expect(rejector).toHaveBeenCalledTimes(1);
// 		});
// 	});

// 	describe("map", () => {
// 		it ("maps task and runs only after fork", async () => {
// 			const resolver = jest.fn().mockImplementationOnce(
// 				() => 42
// 			)
// 			const init = jest.fn().mockImplementationOnce(
// 				() => resolveAfter(resolver, 1000)
// 			);
// 			const task = Task<number>(init)
// 				.map(n => n * 2);
// 			expect(init).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			expect(init).not.toHaveBeenCalled();
// 			const process = task.fork();
// 			expect(init).toHaveBeenCalledTimes(1);
// 			expect(resolver).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			const result = await process;
// 			expect(resolver).toHaveBeenCalledTimes(1);
// 			expect(result.get()).toBe(84);
// 		})

// 		it ("maps task but rejects if error is thrown", async () => {
// 			const rejector = jest.fn().mockImplementationOnce(
// 				() => "error"
// 			)
// 			const init = jest.fn().mockImplementationOnce(
// 				() => rejectsAfter(rejector, 1000)
// 			);
// 			const task = Task<number>(init)
// 				.map(n => n * 2);
// 			expect(init).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			expect(init).not.toHaveBeenCalled();
// 			const process = task.fork();
// 			expect(init).toHaveBeenCalledTimes(1);
// 			expect(rejector).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			const result = await process;
// 			expect(result.getError().get()).toBe("error");
// 			expect(rejector).toHaveBeenCalledTimes(1);
// 		})
// 	})

// 	describe("chain", () => {
// 		it ("chains task and runs only after fork", async () => {
// 			const resolver1 = jest.fn().mockImplementationOnce(
// 				() => 42
// 			)
// 			const resolver2 = jest.fn().mockImplementationOnce(
// 				() => 0
// 			)
// 			const init = jest.fn().mockImplementationOnce(
// 				() => resolveAfter(resolver1, 1000)
// 			);
// 			const init2 = jest.fn().mockImplementation(
// 				() => Promise.resolve(resolver2())
// 			)
// 			const task = Task<number>(init)
// 				.chain(
// 					(n) => Task(init2)
// 				);
// 			expect(init).not.toHaveBeenCalled();
// 			expect(init2).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			expect(init).not.toHaveBeenCalled();
// 			expect(init2).not.toHaveBeenCalled();
// 			const process = task.fork();
// 			expect(init).toHaveBeenCalledTimes(1);
// 			expect(init2).not.toHaveBeenCalled();
// 			expect(resolver1).not.toHaveBeenCalled();
// 			expect(resolver2).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			expect(resolver1).toHaveBeenCalledTimes(1);
// 			expect(init).toHaveBeenCalledTimes(1);
// 			const result = await process;
// 			expect(init2).toHaveBeenCalledTimes(1);
// 			expect(resolver2).toHaveBeenCalledTimes(1);
// 			expect(result.get()).toBe(0);
// 		})

// 		it ("chains task but rejects if error is throw in first task", async () => {
// 			const rejector = jest.fn().mockImplementationOnce(
// 				() => "error"
// 			)
// 			const init = jest.fn().mockImplementationOnce(
// 				() => rejectsAfter(rejector, 1000)
// 			);
// 			const task = Task<number>(init)
// 				.chain(n => resolve(n * 2));
// 			expect(init).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			expect(init).not.toHaveBeenCalled();
// 			const process = task.fork();
// 			expect(init).toHaveBeenCalledTimes(1);
// 			expect(rejector).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			const result = await process;
// 			expect(result.getError().get()).toBe("error");
// 			expect(rejector).toHaveBeenCalledTimes(1);
// 		})


// 		it ("chains task but rejects if error is throw in second task", async () => {
// 			const resolver = jest.fn().mockImplementationOnce(
// 				() => 42
// 			)
// 			const init = jest.fn().mockImplementationOnce(
// 				() => resolveAfter(resolver, 1000)
// 			);
// 			const task = Task<number>(init)
// 				.chain(n => reject("error"));
// 			expect(init).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			expect(init).not.toHaveBeenCalled();
// 			const process = task.fork();
// 			expect(init).toHaveBeenCalledTimes(1);
// 			expect(resolver).not.toHaveBeenCalled();
// 			jest.runAllTimers();
// 			const result = await process;
// 			expect(result.getError().get()).toBe("error");
// 			expect(resolver).toHaveBeenCalledTimes(1);
// 		})
// 	});

// 	describe("resolve", () => {
// 		it ("creates a task that returns a promise that resolves to a value", async () => {
// 			const result = await resolve(42).fork();
// 			expect(result.get()).toBe(42);
// 		})
// 	});
// })