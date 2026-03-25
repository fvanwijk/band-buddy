import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { transposeChord } from './Chord';
import { LyricsBlock } from './LyricsBlock';

describe('LyricsBlock', () => {
  it('renders nothing when lyrics is undefined', () => {
    const { container } = render(<LyricsBlock />);

    expect(container.querySelector('strong')).toBeNull();
  });

  it('renders plain text without chord highlighting', () => {
    render(<LyricsBlock lyrics="Hello world" />);

    expect(screen.getByText('Hello', { exact: false })).toBeInTheDocument();
    expect(screen.queryByRole('strong')).toBeNull();
  });

  it('renders chord tokens as highlighted elements', () => {
    render(<LyricsBlock lyrics="Am G C F" />);

    const chords = screen.getAllByText(/^(Am|G|C|F)$/);
    for (const chord of chords) {
      expect(chord.tagName).toBe('STRONG');
    }
  });

  it('does not highlight non-chord words', () => {
    render(<LyricsBlock lyrics="Hello Am world" />);

    expect(screen.getByText('Am').tagName).toBe('STRONG');
    expect(screen.queryByRole('strong', { name: 'Hello' })).toBeNull();
    expect(screen.queryByRole('strong', { name: 'world' })).not.toBeInTheDocument();
  });

  it('highlights chord aliases with flat alterations', () => {
    render(<LyricsBlock lyrics="Fm7-5 Bb7" />);

    expect(screen.getByText('Fm7-5').tagName).toBe('STRONG');
    expect(screen.getByText('Bb7').tagName).toBe('STRONG');
  });

  it('does not highlight a chord token joined to punctuation', () => {
    render(<LyricsBlock lyrics="(Am) G," />);

    // '(Am)' and 'G,' are not standalone chords
    expect(screen.queryByText('Am')).not.toBeInTheDocument();
    expect(screen.queryByText('G')).not.toBeInTheDocument();
  });

  it('passes transpose to chord rendering', () => {
    render(<LyricsBlock lyrics="C" transpose={2} />);

    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('adds whitespace when a transposed chord is shorter', () => {
    const transpose = 1;
    const first = 'C#';
    const second = 'F#';
    const { container } = render(
      <LyricsBlock lyrics={`${first} ${second}`} transpose={transpose} />,
    );
    const pre = container.querySelector('pre');
    const firstTransposed = transposeChord(first, transpose);
    const secondTransposed = transposeChord(second, transpose);
    const between = ' '.repeat(1 + (first.length - firstTransposed.length));
    const trailing = ' '.repeat(Math.max(0, second.length - secondTransposed.length));
    const expected = `${firstTransposed}${between}${secondTransposed}${trailing}`;

    expect(pre?.textContent).toBe(expected);
  });

  it('removes whitespace when a transposed chord is longer', () => {
    const transpose = 1;
    const first = 'C';
    const second = 'Db';
    const { container } = render(
      <LyricsBlock lyrics={`${first} ${second}`} transpose={transpose} />,
    );
    const pre = container.querySelector('pre');
    const expected = `${transposeChord(first, transpose)}${transposeChord(second, transpose)}`;

    expect(pre?.textContent).toBe(expected);
  });

  it('does not remove whitespace between regular lyric words after compensation', () => {
    const { container } = render(<LyricsBlock lyrics={`Db Don't make`} transpose={1} />);
    const pre = container.querySelector('pre');

    expect(pre?.textContent).toBe(`${transposeChord('Db', 1)}Don't make`);
  });

  it('does not carry whitespace compensation across a line break', () => {
    const { container } = render(<LyricsBlock lyrics={`Db\nFor all`} transpose={1} />);
    const pre = container.querySelector('pre');

    expect(pre?.textContent).toBe(`${transposeChord('Db', 1)}\nFor all`);
  });

  it('preserves whitespace between tokens', () => {
    const { container } = render(<LyricsBlock lyrics={'Am  G'} />);
    const pre = container.querySelector('pre');

    expect(pre?.textContent).toBe('Am  G');
  });
});
