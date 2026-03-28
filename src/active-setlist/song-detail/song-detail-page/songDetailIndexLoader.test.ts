import type { LoaderFunctionArgs } from 'react-router-dom';
import { describe, expect, it } from 'vite-plus/test';

import { songDetailIndexLoader } from './songDetailIndexLoader';

const createLoaderArgs = (songIndex: string, setIndex = '0', setlistId = '0') =>
  ({
    context: {},
    params: { setIndex, setlistId, songIndex },
    request: new Request(`http://localhost/play/${setlistId}/${setIndex}/${songIndex}`),
  }) as unknown as LoaderFunctionArgs;

describe('songDetailIndexLoader', () => {
  it('redirects to lyrics when no default tab is stored', async () => {
    localStorage.removeItem('band-buddy');

    const response = (await songDetailIndexLoader(createLoaderArgs('3'))) as Response;

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/play/0/0/3/lyrics');
  });

  it('redirects to stored default tab for the song', async () => {
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

    const response = (await songDetailIndexLoader(createLoaderArgs('3'))) as Response;

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/play/0/0/3/midi');
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

    const response = (await songDetailIndexLoader(createLoaderArgs('3'))) as Response;

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/play/0/0/3/lyrics');
  });

  it('maps legacy details value to lyrics', async () => {
    localStorage.setItem(
      'band-buddy',
      JSON.stringify([
        {
          setlistSongs: {
            '0_0_3': {
              defaultTab: 'details',
            },
          },
        },
        {},
      ]),
    );

    const response = (await songDetailIndexLoader(createLoaderArgs('3'))) as Response;

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/play/0/0/3/lyrics');
  });
});
