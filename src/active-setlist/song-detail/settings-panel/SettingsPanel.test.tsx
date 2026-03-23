import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vite-plus/test';

import { createSong, createSongTable } from '../../../mocks/songs';
import { StoreProvider } from '../../../store/StoreProvider';
import { getMockStore } from '../../../testUtils';
import type { Song } from '../../../types';
import { SettingsPanel } from './SettingsPanel';

describe('SettingsPanel', () => {
  const getPersistedStore = () => localStorage.getItem('band-buddy') ?? '';

  const songWithAllSettings = createSong({
    id: '1',
    lyrics: 'Lyrics',
    transpose: 2,
  });

  const renderComponent = async (song: Song) => {
    const { store, persister } = getMockStore();
    store.setValue('metronomeVolume', 50);
    store.setValue('showDrawingTools', true);
    store.setRow(
      'songs',
      song.id,
      createSongTable({
        artist: song.artist,
        bpm: song.bpm,
        key: song.key,
        lyrics: song.lyrics,
        timeSignature: song.timeSignature,
        title: song.title,
        transpose: song.transpose,
      }),
    );
    await persister.save();

    render(<SettingsPanel onZoomChange={() => {}} song={song} zoom={1} />, {
      wrapper: StoreProvider,
    });
    await screen.findByTitle('Settings');
  };

  it('renders message when no settings are available', async () => {
    const user = userEvent.setup();

    await renderComponent(
      createSong({
        artist: 'Unknown',
        bpm: undefined,
        id: '2',
        key: undefined,
        lyrics: undefined,
        timeSignature: undefined,
        title: 'Untitled',
        transpose: undefined,
      }),
    );

    await user.click(screen.getByTitle('Settings'));

    expect(screen.getByText('No settings available for this song.')).toBeInTheDocument();
    expect(
      screen.getByText('Add more information such as lyrics, key or BPM to enable settings.'),
    ).toBeInTheDocument();
  });

  it('renders settings panels when song has configurable fields', async () => {
    const user = userEvent.setup();

    await renderComponent(songWithAllSettings);

    await user.click(screen.getByTitle('Settings'));

    expect(screen.getByRole('button', { name: 'Transpose down' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transpose up' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Metronome volume' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Zoom' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Show drawing tools' })).toBeChecked();
  });

  it('updates transpose when transpose panel triggers a change', async () => {
    const user = userEvent.setup();
    await renderComponent(songWithAllSettings);

    await user.click(screen.getByTitle('Settings'));
    await user.click(screen.getByRole('button', { name: 'Transpose up' }));

    await waitFor(() => {
      expect(getPersistedStore()).toContain('"transpose":3');
    });
  });

  it('updates drawing tools setting when checkbox is toggled', async () => {
    const user = userEvent.setup();
    await renderComponent(songWithAllSettings);

    await user.click(screen.getByTitle('Settings'));
    await user.click(screen.getByRole('checkbox', { name: 'Show drawing tools' }));

    await waitFor(() => {
      expect(getPersistedStore()).toContain('"showDrawingTools":false');
    });
  });
});
