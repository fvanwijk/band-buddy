import type { LoaderFunctionArgs } from 'react-router-dom';
import { describe, expect, it } from 'vite-plus/test';

import { songDetailIndexLoader } from './songDetailIndexLoader';

const createLoaderArgs = (setlistSongId: string, setlistId = '0') =>
  ({
    context: {},
    params: { setlistId, setlistSongId },
    request: new Request(`http://localhost/play/${setlistId}/${setlistSongId}`),
  }) as unknown as LoaderFunctionArgs;

describe('songDetailIndexLoader', () => {
  it('returns lyrics when no default tab is stored', async () => {
    localStorage.removeItem('band-buddy');

    const tab = await songDetailIndexLoader(createLoaderArgs('0_0_3'));

    expect(tab).toBe('lyrics');
  });

  it('returns stored default tab for the song', async () => {
    localStorage.setItem(
      'band-buddy',
      JSON.stringify([
        {
          setlistSets: {
            '0': {
              setIndex: 0,
              setlistId: '0',
            },
          },
          setlistSongs: {
            '0_0_3': {
              setId: '0',
              songId: '1',
              songIndex: 3,
            },
          },
          songs: {
            '1': {
              defaultTab: 'midi',
            },
          },
        },
        {},
      ]),
    );

    const tab = await songDetailIndexLoader(createLoaderArgs('0_0_3'));

    expect(tab).toBe('midi');
  });

  it('falls back to lyrics when stored tab is invalid', async () => {
    localStorage.setItem(
      'band-buddy',
      JSON.stringify([
        {
          songs: {
            '3': {
              defaultTab: 'invalid-tab',
            },
          },
        },
        {},
      ]),
    );

    const tab = await songDetailIndexLoader(createLoaderArgs('0_0_3'));

    expect(tab).toBe('lyrics');
  });

  it('maps legacy details value to lyrics', async () => {
    localStorage.setItem(
      'band-buddy',
      JSON.stringify([
        {
          setlistSets: {
            '0': {
              setIndex: 0,
              setlistId: '0',
            },
          },
          setlistSongs: {
            '0_0_3': {
              setId: '0',
              songId: '1',
              songIndex: 3,
            },
          },
          songs: {
            '1': {
              defaultTab: 'details',
            },
          },
        },
        {},
      ]),
    );

    const tab = await songDetailIndexLoader(createLoaderArgs('0_0_3'));

    expect(tab).toBe('lyrics');
  });
});
