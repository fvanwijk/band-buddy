import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { Chord } from './Chord';

describe('Chord', () => {
  it('renders chord text', () => {
    render(<Chord>Am</Chord>);

    expect(screen.getByText('Am')).toBeInTheDocument();
  });

  it('renders as a strong element', () => {
    render(<Chord>G</Chord>);

    expect(screen.getByText('G').tagName).toBe('STRONG');
  });

  it('normalizes ♭ to b', () => {
    render(<Chord>B♭</Chord>);

    expect(screen.getByText('Bb')).toBeInTheDocument();
  });

  it('normalizes ♯ to #', () => {
    render(<Chord>C♯</Chord>);

    expect(screen.getByText('C#')).toBeInTheDocument();
  });

  it('does not transpose when transpose is 0', () => {
    render(<Chord transpose={0}>Am</Chord>);

    expect(screen.getByText('Am')).toBeInTheDocument();
  });

  it('uses 0 as default transpose', () => {
    render(<Chord>Dm</Chord>);

    expect(screen.getByText('Dm')).toBeInTheDocument();
  });

  it('transposes up by semitones', () => {
    render(<Chord transpose={2}>C</Chord>);

    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('transposes down by semitones', () => {
    render(<Chord transpose={-1}>C</Chord>);

    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('transposes a normalized flat chord', () => {
    render(<Chord transpose={2}>B♭</Chord>);

    expect(screen.getByText('C')).toBeInTheDocument();
  });
});
