import { describe, expect, it } from 'vite-plus/test';

import { migrateBackup, migratePersistedStore } from './index';
import { CURRENT_BACKUP_VERSION } from './persistedStoreVersion';

describe('migrateBackup', () => {
  it('should return unchanged data for current version', () => {
    const v3Backup = {
      tables: {
        instruments: {},
        setlistSets: { '1': { setIndex: 1, setlistId: '1' } },
        setlistSongs: { '0': { setId: '1', songId: '1', songIndex: 0 } },
        setlists: { '1': { date: '2024-01-01', title: 'Setlist 1' } },
        songs: { '1': { artist: 'Artist 1', title: 'Song 1' } },
      },
      values: { locale: 'en-US' },
      version: 3,
    };

    const result = migrateBackup(v3Backup, 3);

    expect(result.error).toBeUndefined();
    expect(result.tables.songs).toEqual(v3Backup.tables.songs);
    expect(result.values).toEqual(v3Backup.values);
  });

  it('should migrate from v1 to v2', () => {
    const v1Backup = {
      tables: {
        instruments: {},
        setlistSongs: {
          '0': { setNumber: 1, setlistId: '1', songId: '1', songIndex: 0 },
        },
        setlists: { '1': { date: '2024-01-01', title: 'Setlist 1' } },
        songs: { '1': { artist: 'Artist 1', title: 'Song 1' } },
      },
      values: { locale: 'en-US' },
      version: 1,
    };

    const result = migrateBackup(v1Backup, 1);

    expect(result.error).toBeUndefined();
    expect(result.tables.songs).toBeDefined();
    expect(result.tables.setlistSets).toBeDefined();
    expect(result.tables.setlistSongs).toBeDefined();
    expect(result.values.locale).toBe('en-US');
  });

  it('should reject future versions', () => {
    const v4Backup = {
      tables: {},
      values: {},
      version: 4,
    };

    const result = migrateBackup(v4Backup, 4);

    expect(result.error).toBeDefined();
    expect(result.error).toContain('newer');
  });

  it('should reject invalid versions', () => {
    const invalidBackup = {
      tables: {},
      values: {},
      version: 0,
    };

    const result = migrateBackup(invalidBackup, 0);

    expect(result.error).toBeDefined();
  });

  it('should return error message on migration failure', () => {
    const invalidBackup = {
      tables: {
        setlistSongs: {
          '0': { setlistId: '1', songId: '1', songIndex: 0 }, // Missing setNumber
        },
      },
      values: {},
      version: 1,
    };

    const result = migrateBackup(invalidBackup, 1);

    expect(result.error).toBeDefined();
    expect(result.error).toContain('Failed to derive setlistId/setNumber');
  });

  it('should migrate v2 MIDI buttons to v3 shape', () => {
    const v2Backup = {
      tables: {
        instruments: {
          '0': { midiInId: '1', midiInName: 'Out 1', name: 'Nord Stage 4' },
        },
        setlistSets: { '1': { setIndex: 1, setlistId: '1' } },
        setlistSongs: { '0': { setId: '1', songId: '1', songIndex: 0 } },
        setlists: { '1': { date: '2024-01-01', title: 'Setlist 1' } },
        songs: {
          '1': {
            artist: 'Artist 1',
            midiEvents: JSON.stringify([
              {
                id: 'midi-1',
                instrumentId: '0',
                label: 'Organ',
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

    const result = migrateBackup(v2Backup, 2);

    expect(result.error).toBeUndefined();

    const migratedSong = result.tables.songs?.['1'] as Record<string, unknown>;
    expect(migratedSong).toBeDefined();
    expect(JSON.parse(String(migratedSong.midiEvents))).toEqual([
      {
        events: [{ instrumentId: '0', programChange: 12 }],
        id: 'midi-1',
        label: 'Organ',
      },
    ]);
  });

  it('should migrate persisted v1 local data to v2 format', () => {
    const persistedV1 = JSON.stringify([
      {
        instruments: {},
        setlistSongs: {
          '0': { setNumber: 1, setlistId: '1', songId: '1', songIndex: 0 },
        },
        setlists: { '1': { date: '2024-01-01', title: 'Setlist 1' } },
        songs: { '1': { artist: 'Artist 1', title: 'Song 1' } },
      },
      { locale: 'en-US' },
    ]);

    const result = migratePersistedStore(persistedV1, null);

    expect(result.error).toBeUndefined();
    expect(result.migrated).toBe(true);

    const [tables, values] = JSON.parse(result.persisted || '[]') as [
      Record<string, Record<string, unknown>>,
      Record<string, unknown>,
    ];

    expect(values.locale).toBe('en-US');
    expect(Object.values(tables.setlistSets || {})).toHaveLength(1);
    expect(Object.values(tables.setlistSongs || {})).toEqual([
      { setId: '0', songId: '1', songIndex: 0 },
    ]);
  });

  it('should leave persisted current-version local data unchanged', () => {
    const persistedV3 = JSON.stringify([
      {
        instruments: {},
        setlistSets: { '1': { setIndex: 1, setlistId: '1' } },
        setlistSongs: { '0': { setId: '1', songId: '1', songIndex: 0 } },
        setlists: { '1': { date: '2024-01-01', title: 'Setlist 1' } },
        songs: { '1': { artist: 'Artist 1', title: 'Song 1' } },
      },
      { locale: 'en-US' },
    ]);

    const result = migratePersistedStore(persistedV3, String(CURRENT_BACKUP_VERSION));

    expect(result.error).toBeUndefined();
    expect(result.migrated).toBe(false);
    expect(result.persisted).toBe(persistedV3);
  });
});
