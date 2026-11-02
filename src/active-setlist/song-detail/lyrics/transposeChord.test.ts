import { describe, expect, it } from 'vite-plus/test';

import { transposeChord } from './transposeChord';

describe('transposeChord', () => {
  it('returns the normalized chord when not transposing', () => {
    expect(transposeChord('B♭m', 0, 'Bb')).toBe('Bbm');
  });

  it('spells F# down one semitone as F instead of E#', () => {
    expect(transposeChord('F#', -1, 'F#')).toBe('F');
    expect(transposeChord('B', -1, 'F#')).toBe('Bb');
    expect(transposeChord('C#m7', -1, 'F#')).toBe('Cm7');
    expect(transposeChord('G#m', -1, 'F#')).toBe('Gm');
    expect(transposeChord('E', -1, 'F#')).toBe('Eb');
  });

  it('keeps slash chord bass notes in the target key spelling', () => {
    expect(transposeChord('F#/A#', -1, 'F#')).toBe('F/A');
    expect(transposeChord('B/D#', -1, 'F#')).toBe('Bb/D');
  });

  it('uses the key with the fewest accidentals', () => {
    expect(transposeChord('C', 1, 'C')).toBe('Db');
    expect(transposeChord('C', 2, 'C')).toBe('D');
    expect(transposeChord('Em', 1, 'Am')).toBe('Fm');
    expect(transposeChord('Bb', 2, 'Bb')).toBe('C');
  });

  it('uses sharps for sharp target keys', () => {
    expect(transposeChord('C#m', 2, 'A')).toBe('D#m');
    expect(transposeChord('F#m', 2, 'A')).toBe('G#m');
    expect(transposeChord('E', 1, 'D')).toBe('F');
  });

  it('keeps suffixes like extensions intact', () => {
    expect(transposeChord('F#maj7', -1, 'F#')).toBe('Fmaj7');
    expect(transposeChord('C7b9', 1, 'C')).toBe('Db7b9');
  });

  it('falls back to the chord accidental style without a song key', () => {
    expect(transposeChord('C', -1)).toBe('B');
    expect(transposeChord('Bb', 1)).toBe('B');
    expect(transposeChord('Eb', 1)).toBe('E');
    expect(transposeChord('Eb', 2)).toBe('F');
  });
});
