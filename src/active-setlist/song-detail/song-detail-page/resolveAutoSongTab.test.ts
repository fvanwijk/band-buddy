import { describe, expect, it } from 'vite-plus/test';

import { resolveAutoSongTab } from './resolveAutoSongTab';

describe('resolveAutoSongTab', () => {
  it('returns the first tab with content in priority order', () => {
    expect(
      resolveAutoSongTab({
        notes: 'Remember the cue',
        sheetMusicFilename: 'song.pdf',
      }),
    ).toBe('sheet-music');
  });

  it('treats missing default tab like auto when midi buttons are the first content', () => {
    expect(
      resolveAutoSongTab({
        midiEvents: JSON.stringify([{ events: [{ instrumentId: '0', programChange: 1 }] }]),
      }),
    ).toBe('midi');
  });

  it('falls back to lyrics when no content exists', () => {
    expect(resolveAutoSongTab({})).toBe('lyrics');
  });
});
