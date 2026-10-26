import { describe, expect, it } from 'vite-plus/test';

import { migrateV4ToV5 } from './migration';

describe('v4-to-v5 migration', () => {
  it('moves MIDI button triggers into typed song events', () => {
    const v4Backup = {
      tables: {
        songs: {
          '1': {
            artist: 'Artist 1',
            midiButtonTriggers: JSON.stringify([
              { beat: 1, id: 'trigger-1', measure: 2, midiEventId: 'midi-1' },
              { beat: 3, id: 'trigger-2', measure: 9, midiEventId: 'midi-2' },
            ]),
            title: 'Song 1',
          },
        },
      },
      values: { locale: 'en-US' },
      version: 4,
    };

    const result = migrateV4ToV5(v4Backup);

    expect(result.values).toEqual(v4Backup.values);
    const row = result.tables.songs?.['1'] as Record<string, unknown>;

    expect(row.midiButtonTriggers).toBeUndefined();
    expect(row.artist).toBe('Artist 1');
    expect(JSON.parse(String(row.events))).toEqual([
      { beat: 1, id: 'trigger-1', measure: 2, midiEventId: 'midi-1', type: 'midiButton' },
      { beat: 3, id: 'trigger-2', measure: 9, midiEventId: 'midi-2', type: 'midiButton' },
    ]);
  });

  it('leaves songs without triggers untouched', () => {
    const result = migrateV4ToV5({
      tables: { songs: { '1': { artist: 'Artist 1', title: 'Song 1' } } },
      version: 4,
    });

    expect(result.tables.songs?.['1']).toEqual({ artist: 'Artist 1', title: 'Song 1' });
  });

  it('drops invalid triggers and malformed JSON', () => {
    const result = migrateV4ToV5({
      tables: {
        songs: {
          '1': {
            midiButtonTriggers: JSON.stringify([
              { beat: 1, id: 'valid', measure: 1, midiEventId: 'midi-1' },
              { beat: 0, id: 'invalid-beat', measure: 1, midiEventId: 'midi-1' },
              { id: 'incomplete' },
            ]),
            title: 'Song 1',
          },
          '2': { midiButtonTriggers: '{not json', title: 'Song 2' },
          '3': { midiButtonTriggers: '{"not":"an array"}', title: 'Song 3' },
        },
      },
      version: 4,
    });

    const songs = result.tables.songs as Record<string, Record<string, unknown>>;

    expect(JSON.parse(String(songs['1'].events))).toEqual([
      { beat: 1, id: 'valid', measure: 1, midiEventId: 'midi-1', type: 'midiButton' },
    ]);
    expect(songs['2']).toEqual({ title: 'Song 2' });
    expect(songs['3']).toEqual({ title: 'Song 3' });
  });

  it('handles a backup without songs', () => {
    const result = migrateV4ToV5({ tables: {}, version: 4 });

    expect(result.tables.songs).toEqual({});
    expect(result.values).toEqual({});
  });

  it('throws on invalid payload', () => {
    expect(() => migrateV4ToV5({ tables: { songs: {} }, version: 3 })).toThrow(
      'The backup file format is invalid or corrupted.',
    );
  });
});
