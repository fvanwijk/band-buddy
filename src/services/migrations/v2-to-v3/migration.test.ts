import { describe, expect, it } from 'vite-plus/test';

import { migrateV2ToV3 } from './migration';

describe('v2-to-v3 migration', () => {
  it('converts legacy midiEvents entries to multi-event button shape', () => {
    const v2Backup = {
      tables: {
        songs: {
          '1': {
            artist: 'Artist 1',
            midiEvents: JSON.stringify([
              {
                id: 'midi-1',
                instrumentId: 'inst-1',
                label: 'Verse',
                programChange: 12,
              },
            ]),
            title: 'Song 1',
          },
        },
      },
      values: { locale: 'en-US' },
      version: 2,
    };

    const result = migrateV2ToV3(v2Backup);

    expect(result.values).toEqual(v2Backup.values);
    expect(result.tables.songs?.['1']).toBeDefined();

    const row = result.tables.songs?.['1'] as Record<string, unknown>;
    const midiEvents = JSON.parse(row.midiEvents as string) as Array<Record<string, unknown>>;

    expect(midiEvents).toEqual([
      {
        events: [{ instrumentId: 'inst-1', programChange: 12, type: 'programChange' }],
        id: 'midi-1',
        label: 'Verse',
      },
    ]);
  });

  it('normalizes already-migrated program change actions to include explicit type', () => {
    const v2Backup = {
      tables: {
        songs: {
          '1': {
            artist: 'Artist 1',
            midiEvents: JSON.stringify([
              {
                events: [{ instrumentId: 'inst-1', programChange: 12 }],
                id: 'midi-1',
                label: 'Verse',
              },
            ]),
            title: 'Song 1',
          },
        },
      },
      values: {},
      version: 2,
    };

    const result = migrateV2ToV3(v2Backup);

    const row = result.tables.songs?.['1'] as Record<string, unknown>;
    expect(JSON.parse(row.midiEvents as string)).toEqual([
      {
        events: [{ instrumentId: 'inst-1', programChange: 12, type: 'programChange' }],
        id: 'midi-1',
        label: 'Verse',
      },
    ]);
  });

  it('throws on invalid payload', () => {
    const invalidBackup = {
      tables: {
        songs: {
          '1': { title: 'Song 1' },
        },
      },
      version: 3,
    };

    expect(() => migrateV2ToV3(invalidBackup)).toThrow('invalid or corrupted');
  });
});
