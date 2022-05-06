
import { array, values } from '../src/optics/traversal';

describe('Traversal', () => {
  it ('array', () => {
    expect(array<number>().modify(
      (num) => num * 2,
      [1, 2, 3]
    )).toEqual([2, 4, 6]);
  });

  it ('some', () => {
    expect(array<number>()
      .some(num => num % 2 === 0)
      .modify(
        (num) => num * 2,
        [1, 2, 3]
      )).toEqual([1, 4, 3]);
  });

  it('compose', () => {
    const trav = values<Record<string, number[]>>();
    const trav2 = array<number>();
    expect(trav.compose(trav2).modify(
      (num) => num * 2,
      { 
        'first': [1,2,3],
        'second': [4,5,6]
      }
    )).toEqual({
      'first': [2,4,6],
      'second': [8,10,12]
    });
  });
});