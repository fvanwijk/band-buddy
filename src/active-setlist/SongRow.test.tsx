import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { createSong } from '../mocks/songs';
import { MockRouteProvider } from '../testUtils';
import { SongRow } from './SongRow';

describe('SongRow', () => {
  it('renders song details', () => {
    render(
      <ul>
        <SongRow index={3} setlistId="2" setlistSongId="abc" song={createSong()} />
      </ul>,
      { wrapper: MockRouteProvider },
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/play/2/abc');
    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();
    expect(screen.getByText('Queen')).toBeInTheDocument();
    expect(screen.getAllByText('Bb').length).toBeGreaterThan(0);
    expect(screen.getByTestId('song-duration')).toHaveTextContent('5m 55s');
    expect(screen.queryByText('4/4')).not.toBeInTheDocument();
  });

  it('shows transpose indicator when transpose is non-zero', () => {
    render(
      <ul>
        <SongRow index={1} setlistId="2" setlistSongId="abc" song={createSong({ transpose: 2 })} />
      </ul>,
      { wrapper: MockRouteProvider },
    );

    expect(screen.getAllByText('+2').length).toBeGreaterThan(0);
  });

  it('shows negative transpose indicator', () => {
    render(
      <ul>
        <SongRow index={1} setlistId="2" setlistSongId="abc" song={createSong({ transpose: -3 })} />
      </ul>,
      { wrapper: MockRouteProvider },
    );

    expect(screen.getAllByText('-3').length).toBeGreaterThan(0);
  });

  it('does not show transpose indicator when transpose is 0', () => {
    render(
      <ul>
        <SongRow index={1} setlistId="2" setlistSongId="abc" song={createSong({ transpose: 0 })} />
      </ul>,
      { wrapper: MockRouteProvider },
    );

    expect(screen.queryByText('+0')).toBeNull();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('shows which content the song has', () => {
    render(
      <ul>
        <SongRow
          index={1}
          setlistId="2"
          setlistSongId="abc"
          song={createSong({ events: [], midiEvents: [], notes: '' })}
        />
      </ul>,
      { wrapper: MockRouteProvider },
    );

    expect(screen.getByRole('img', { name: 'Has lyrics' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Has sheet music' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'No text notes' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'No MIDI buttons' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'No events' })).toBeInTheDocument();
  });

  it('highlights the text notes indicator when there are only text note drawings', () => {
    const stroke = { drawMode: true, paths: [{ x: 1, y: 1 }], strokeColor: '#fff', strokeWidth: 2 };
    render(
      <ul>
        <SongRow
          index={1}
          setlistId="2"
          setlistSongId="abc"
          song={createSong({
            lyrics: '',
            lyricsCanvasPaths: [stroke],
            notes: '',
            textNotesCanvasPaths: [stroke],
          })}
        />
      </ul>,
      { wrapper: MockRouteProvider },
    );

    expect(screen.getByRole('img', { name: 'Has text notes' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'No lyrics' })).toBeInTheDocument();
  });
});
