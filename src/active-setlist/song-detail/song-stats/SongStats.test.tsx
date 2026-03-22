import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import type { Song } from '../../../types';
import { SongStats } from './SongStats';

const baseSong: Song = {
  artist: 'Queen',
  id: '1',
  title: 'Bohemian Rhapsody',
};

describe('SongStats', () => {
  it('renders all stats when all fields are present', () => {
    const song: Song = {
      ...baseSong,
      bpm: 72,
      duration: 354,
      key: 'Bb',
      timeSignature: '4/4',
    };

    render(<SongStats song={song} />);

    expect(screen.getByText('Key')).toBeInTheDocument();
    expect(screen.getByText('Bb')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('4/4')).toBeInTheDocument();
    expect(screen.getByText('BPM')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('5m 54s')).toBeInTheDocument();
  });

  it('renders only key when only key is present', () => {
    const song: Song = {
      ...baseSong,
      key: 'C',
    };

    render(<SongStats song={song} />);

    expect(screen.getByText('Key')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.queryByText('Time')).not.toBeInTheDocument();
    expect(screen.queryByText('BPM')).not.toBeInTheDocument();
    expect(screen.queryByText('Duration')).not.toBeInTheDocument();
  });

  it('renders empty when no optional fields are present', () => {
    const song: Song = { ...baseSong };

    const { container } = render(<SongStats song={song} />);

    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders key with positive transpose', () => {
    const song: Song = {
      ...baseSong,
      key: 'C',
      transpose: 2,
    };

    render(<SongStats song={song} />);

    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders key with negative transpose', () => {
    const song: Song = {
      ...baseSong,
      key: 'D',
      transpose: -3,
    };

    render(<SongStats song={song} />);

    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('-3')).toBeInTheDocument();
  });

  it('renders key without transpose when transpose is zero', () => {
    const song: Song = {
      ...baseSong,
      key: 'E',
      transpose: 0,
    };

    render(<SongStats song={song} />);

    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });

  it('renders time signature and BPM only', () => {
    const song: Song = {
      ...baseSong,
      bpm: 120,
      timeSignature: '3/4',
    };

    render(<SongStats song={song} />);

    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('3/4')).toBeInTheDocument();
    expect(screen.getByText('BPM')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.queryByText('Key')).not.toBeInTheDocument();
    expect(screen.queryByText('Duration')).not.toBeInTheDocument();
  });

  it('renders duration only', () => {
    const song: Song = {
      ...baseSong,
      duration: 180,
    };

    render(<SongStats song={song} />);

    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('3m 0s')).toBeInTheDocument();
    expect(screen.queryByText('Key')).not.toBeInTheDocument();
    expect(screen.queryByText('Time')).not.toBeInTheDocument();
    expect(screen.queryByText('BPM')).not.toBeInTheDocument();
  });
});
