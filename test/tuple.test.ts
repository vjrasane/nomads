import { Tuple } from '../src/monads/tuple';

describe('Tuple', () => {
  it ('tags', () => {
    const tuple = Tuple.of(4, 2);
    expect(tuple.tag).toBe('tuple');
    expect(tuple.tuple).toEqual([4, 2]);
    expect(tuple.toArray()).toEqual([4, 2]);
    expect(tuple.first).toEqual(4);
    expect(tuple.second).toEqual(2);
  });

  it ('mapFirst', () => {
    expect(Tuple.of(4, 2).mapFirst(n => n * 2).tuple).toEqual([8, 2]);
  });

  it ('mapSecond', () => {
    expect(Tuple.of(4, 2).mapSecond(n => n * 2).tuple).toEqual([4, 4]);
  });

  it ('mapBoth', () => {
    expect(Tuple.of(4, 2).mapBoth(n => n * 2, n => n * 3).tuple).toEqual([8, 6]);
  });

  it('swap', () => {
    expect(Tuple.of(4, 2).swap().tuple).toEqual([2, 4]);
  });

  it('fold', () => {
    expect(Tuple.of(4, 2).fold((a, b) => a + b)).toBe(6);
  });

  it('double', () => {
    expect(Tuple.double(6).tuple).toEqual([6,6]);
  });

  it('toString', () => {
    expect(Tuple.of(4, 2).toString()).toBe('Tuple(4, 2)');
  });

  it('fromArray', () => {
    expect(Tuple.fromArray([4, 2]).tuple).toEqual([4, 2]);
  });
});