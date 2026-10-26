import { describe, expect, it } from 'vite-plus/test';

import { getPreCountBeats, getPreCountWord } from './preCount';

describe('preCount', () => {
  it('lasts two measures', () => {
    expect(getPreCountBeats(4)).toBe(8);
  });

  it('says "one, two, one two three four" in 4/4', () => {
    const words = Array.from({ length: 8 }, (_, beat) => getPreCountWord(beat, 4));

    expect(words).toEqual(['one', null, 'two', null, 'one', 'two', 'three', 'four']);
  });

  it('counts groups of three in 6/8', () => {
    const words = Array.from({ length: 12 }, (_, beat) => getPreCountWord(beat, 6));

    expect(words).toEqual([
      'one',
      null,
      null,
      'two',
      null,
      null,
      'one',
      'two',
      'three',
      'two',
      'two',
      'three',
    ]);
  });

  it('only speaks recorded words in other longer measures', () => {
    const words = Array.from({ length: 5 }, (_, beat) => getPreCountWord(beat + 5, 5));

    expect(words).toEqual(['one', 'two', 'three', 'four', null]);
  });

  it('counts both measures in 3/4', () => {
    const words = Array.from({ length: 6 }, (_, beat) => getPreCountWord(beat, 3));

    expect(words).toEqual(['one', 'two', 'three', 'one', 'two', 'three']);
  });
});
