import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { StoreProvider } from '../../../store/StoreProvider';
import type { Song } from '../../../types';
import { SongStats } from './SongStats';

const baseSong: Song = {
  artist: 'Queen',
  id: '1',
  title: 'Bohemian Rhapsody',
};

describe('SongStats', () => {
  const renderComponent = async (song: Song) => {
    const result = render(
      <StoreProvider>
        <SongStats song={song} />
      </StoreProvider>,
    );
    await screen.findByTestId('song-stats');
    return result;
  };

  it('renders all stats when all fields are present', async () => {
    const song: Song = {
      ...baseSong,
      bpm: 72,
      duration: 354,
      key: 'Bb',
      timeSignature: '4/4',
    };

    await renderComponent(song);

    expect(screen.getByText('Key')).toBeInTheDocument();
    expect(screen.getByText('Bb')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('4/4')).toBeInTheDocument();
    expect(screen.getByText('BPM')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('5m 54s')).toBeInTheDocument();
  });

  it('renders only key when only key is present', async () => {
    const song: Song = {
      ...baseSong,
      key: 'C',
    };

    await renderComponent(song);

    expect(screen.getByText('Key')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.queryByText('Time')).not.toBeInTheDocument();
    expect(screen.queryByText('BPM')).not.toBeInTheDocument();
    expect(screen.queryByText('Duration')).not.toBeInTheDocument();
  });

  it('renders empty when no optional fields are present', async () => {
    const song: Song = { ...baseSong };

    await renderComponent(song);

    expect(screen.getByTestId('song-stats')).toBeEmptyDOMElement();
  });

  it('renders key with positive transpose', async () => {
    const song: Song = {
      ...baseSong,
      key: 'C',
      transpose: 2,
    };

    await renderComponent(song);

    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders key with negative transpose', async () => {
    const song: Song = {
      ...baseSong,
      key: 'D',
      transpose: -3,
    };

    await renderComponent(song);

    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('-3')).toBeInTheDocument();
  });

  it('renders key without transpose when transpose is zero', async () => {
    const song: Song = {
      ...baseSong,
      key: 'E',
      transpose: 0,
    };

    await renderComponent(song);

    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });

  it('renders time signature and BPM only', async () => {
    const song: Song = {
      ...baseSong,
      bpm: 120,
      timeSignature: '3/4',
    };

    await renderComponent(song);

    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('3/4')).toBeInTheDocument();
    expect(screen.getByText('BPM')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.queryByText('Key')).not.toBeInTheDocument();
    expect(screen.queryByText('Duration')).not.toBeInTheDocument();
  });

  it('renders duration only', async () => {
    const song: Song = {
      ...baseSong,
      duration: 180,
    };

    await renderComponent(song);

    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('3m 0s')).toBeInTheDocument();
    expect(screen.queryByText('Key')).not.toBeInTheDocument();
    expect(screen.queryByText('Time')).not.toBeInTheDocument();
    expect(screen.queryByText('BPM')).not.toBeInTheDocument();
  });
});
