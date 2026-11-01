import { describe, expect, it } from 'vite-plus/test';

import { parseSpotifyTrackId } from './parseSpotifyTrackId';

describe('parseSpotifyTrackId', () => {
  it.each([
    ['4uLU6hMCjMI75M1A2tKUQC', '4uLU6hMCjMI75M1A2tKUQC'],
    ['  4uLU6hMCjMI75M1A2tKUQC  ', '4uLU6hMCjMI75M1A2tKUQC'],
    ['spotify:track:4uLU6hMCjMI75M1A2tKUQC', '4uLU6hMCjMI75M1A2tKUQC'],
    ['https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=abc', '4uLU6hMCjMI75M1A2tKUQC'],
    ['https://open.spotify.com/intl-nl/track/4uLU6hMCjMI75M1A2tKUQC', '4uLU6hMCjMI75M1A2tKUQC'],
  ])('parses %s', (input, expected) => {
    expect(parseSpotifyTrackId(input)).toBe(expected);
  });

  it.each([
    '',
    'not a track',
    'https://open.spotify.com/album/4uLU6hMCjMI75M1A2tKUQC',
    'https://example.com/track/4uLU6hMCjMI75M1A2tKUQC',
    'spotify:album:4uLU6hMCjMI75M1A2tKUQC',
  ])('returns undefined for %j', (input) => {
    expect(parseSpotifyTrackId(input)).toBeUndefined();
  });
});
