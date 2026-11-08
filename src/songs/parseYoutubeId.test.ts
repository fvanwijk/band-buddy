import { describe, expect, it } from 'vite-plus/test';

import { parseYoutubeId } from './parseYoutubeId';

describe('parseYoutubeId', () => {
  it.each([
    ['dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['  dQw4w9WgXcQ  ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s', 'dQw4w9WgXcQ'],
    ['https://youtube.com/watch?list=abc&v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://music.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?si=abc', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/live/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('parses %s', (input, expected) => {
    expect(parseYoutubeId(input)).toBe(expected);
  });

  it.each([
    '',
    'not a video',
    'tooshort',
    'https://www.youtube.com/watch',
    'https://www.youtube.com/playlist?list=PL1234567890A',
    'https://example.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/',
  ])('returns undefined for %j', (input) => {
    expect(parseYoutubeId(input)).toBeUndefined();
  });
});
