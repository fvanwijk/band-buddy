import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { createSongTable } from '../mocks/songs';
import { StoreProvider } from '../store/StoreProvider';
import { getMockStore } from '../testUtils';
import { useGetSongs } from './useSong';

const setupStore = async () => {
  const { store, persister } = getMockStore();

  store.setRow(
    'songs',
    '0',
    createSongTable({ artist: 'Queen', bpm: 72, title: 'Bohemian Rhapsody' }),
  );
  store.setRow(
    'songs',
    '1',
    createSongTable({ artist: 'Earth, Wind & Fire', bpm: 126, title: 'September' }),
  );
  store.setRow(
    'songs',
    '2',
    createSongTable({ artist: 'Stevie Wonder', bpm: 100, title: 'superstition' }),
  );

  await persister.save();
};

describe('useGetSongs', () => {
  it('sorts by title ascending by default', async () => {
    await setupStore();

    const { result } = renderHook(() => useGetSongs(), { wrapper: StoreProvider });

    await waitFor(() => expect(result.current).not.toBeNull());

    expect(result.current.map((s) => s.title)).toEqual([
      'Bohemian Rhapsody',
      'September',
      'superstition',
    ]);
  });

  it('sorts by a different field (artist) ascending', async () => {
    await setupStore();

    const { result } = renderHook(
      () => useGetSongs(false, { sortBy: 'artist', sortDirection: 'asc' }),
      {
        wrapper: StoreProvider,
      },
    );

    await waitFor(() => expect(result.current).not.toBeNull());

    expect(result.current.map((s) => s.artist)).toEqual([
      'Earth, Wind & Fire',
      'Queen',
      'Stevie Wonder',
    ]);
  });

  it('sorts by a numeric field (bpm) ascending', async () => {
    await setupStore();

    const { result } = renderHook(
      () => useGetSongs(false, { sortBy: 'bpm', sortDirection: 'asc' }),
      {
        wrapper: StoreProvider,
      },
    );

    await waitFor(() => expect(result.current).not.toBeNull());

    expect(result.current.map((s) => s.bpm)).toEqual([72, 100, 126]);
  });

  it('sorts descending', async () => {
    await setupStore();

    const { result } = renderHook(
      () => useGetSongs(false, { sortBy: 'title', sortDirection: 'desc' }),
      {
        wrapper: StoreProvider,
      },
    );

    await waitFor(() => expect(result.current).not.toBeNull());

    expect(result.current.map((s) => s.title)).toEqual([
      'superstition',
      'September',
      'Bohemian Rhapsody',
    ]);
  });

  it('returns all songs when sortBy is null', async () => {
    await setupStore();

    const { result } = renderHook(() => useGetSongs(false, { sortBy: null }), {
      wrapper: StoreProvider,
    });

    await waitFor(() => expect(result.current).toHaveLength(3));
  });

  it('returns all songs when sortDirection is none', async () => {
    await setupStore();

    const { result } = renderHook(
      () => useGetSongs(false, { sortBy: 'title', sortDirection: 'none' }),
      {
        wrapper: StoreProvider,
      },
    );

    await waitFor(() => expect(result.current).toHaveLength(3));
  });
});
