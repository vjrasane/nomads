import { Iso } from '../src/optics/iso';

describe('Iso', () => {
  it('get', () => {
    const iso = Iso({
      get: (str: string) => str.split(''),
      reverseGet: (arr: string[]) => arr.join(''),
    });

    expect(iso.get('str')).toEqual(['s', 't', 'r']);
  });

  it('reverseGet', () => {
    const iso = Iso({
      get: (str: string) => str.split(''),
      reverseGet: (arr: string[]) => arr.join(''),
    });

    expect(iso.reverseGet(['s', 't', 'r'])).toEqual('str');
  });

  it('modify', () => {
    const iso = Iso({
      get: (str: string) => str.split(''),
      reverseGet: (arr: string[]) => arr.join(''),
    });

    expect(iso.modify((arr) => ['^', ...arr, '$'], 'str')).toEqual('^str$');
  });

  it('reverse', () => {
    const iso = Iso({
      get: (str: string) => str.split(''),
      reverseGet: (arr: string[]) => arr.join(''),
    }).reverse();

    expect(iso.get(['s', 't', 'r'])).toEqual('str');
    expect(iso.reverseGet('str')).toEqual(['s', 't', 'r']);
  });

  it('compose', () => {
    const iso = Iso({
      get: (str: string) => str.split(''),
      reverseGet: (arr: string[]) => arr.join(''),
    });
    const iso2 = Iso({
      get: (arr: string[]): Record<number, string> => ({ ...arr }),
      reverseGet: (obj: Record<number, string>): string[] => Object.values(obj),
    });
    expect(iso.compose(iso2).modify((obj) => ({ ...obj, 4: 'x' }), 'str')).toBe('strx');
  });
});
