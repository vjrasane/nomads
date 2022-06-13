import Tuple from '../tuple';

describe('Tuple', () => {
  it ('tags', () => {
    const tuple = Tuple(4, 2);
    expect(tuple.tag).toBe('tuple');
    expect(tuple.toArray()).toEqual([4, 2]);
    expect(tuple.first).toEqual(4);
    expect(tuple.second).toEqual(2);
  });

  it ('mapFirst', () => {
    expect(Tuple(4, 2).mapFirst(n => n * 2).toArray()).toEqual([8, 2]);
  });

  it ('mapSecond', () => {
    expect(Tuple(4, 2).mapSecond(n => n * 2).toArray()).toEqual([4, 4]);
  });

  it ('mapBoth', () => {
    expect(Tuple(4, 2).mapBoth(n => n * 2, n => n * 3).toArray()).toEqual([8, 6]);
  });

  it('swap', () => {
    expect(Tuple(4, 2).swap().toArray()).toEqual([2, 4]);
  });

  it('fold', () => {
    expect(Tuple(4, 2).fold((a, b) => a + b)).toBe(6);
  });

  it('double', () => {
    expect(Tuple.double(6).toArray()).toEqual([6,6]);
  });

  it('toString', () => {
    expect(Tuple(4, 2).toString()).toBe('Tuple(4, 2)');
  });

  it('fromArray', () => {
    expect(Tuple.fromArray([4, 2]).toArray()).toEqual([4, 2]);
  });
});