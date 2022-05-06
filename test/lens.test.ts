import { prop } from '../src/optics/lens';

describe('Lens', () => {
  it('prop', () => {
    const data = {
      first: {
        second: {
          third: 'value'
        }
      }
    };

    const first = prop<typeof data>('first');
    const second = prop<typeof data['first']>('second');
    const third = prop<typeof data['first']['second']>('third');

    const comp = first.compose(second).compose(third);
    expect(comp.get(data)).toBe('value');
    expect(comp.set('modified', data)).toEqual( {
      first: {
        second: {
          third: 'modified'
        }
      }
    });
  });
});