import { describe, expect, it } from 'vite-plus/test';

import { tolerantDeserializer } from './SpotifyContext';

describe('tolerantDeserializer', () => {
  it('parses JSON bodies', async () => {
    const response = new Response('{"is_playing":true}');

    expect(await tolerantDeserializer.deserialize(response)).toEqual({ is_playing: true });
  });

  it('returns null for empty bodies', async () => {
    expect(await tolerantDeserializer.deserialize(new Response(''))).toBeNull();
  });

  it('returns null for plain text bodies, like the ones Spotify returns for player commands', async () => {
    expect(await tolerantDeserializer.deserialize(new Response('UmVYBo-WHj'))).toBeNull();
  });
});
