import { describe, expect, it } from 'vitest';
import { migrateBackup } from './index';

describe('migrateBackup', () => {
  it('should return unchanged data for current version', () => {
    const v2Backup = {
      tables: {
        instruments: {},
        setlistSets: { '1': { setIndex: 1, setlistId: '1' } },
        setlistSongs: { '0': { setId: '1', songId: '1', songIndex: 0 } },
        setlists: { '1': { date: '2024-01-01', title: 'Setlist 1' } },
        songs: { '1': { artist: 'Artist 1', title: 'Song 1' } },
      },
      values: { locale: 'en-US' },
      version: 2,
    };

    const result = migrateBackup(v2Backup, 2);

    expect(result.error).toBeUndefined();
    expect(result.tables.songs).toEqual(v2Backup.tables.songs);
    expect(result.values).toEqual(v2Backup.values);
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
    const v3Backup = {
      tables: {},
      values: {},
      version: 3,
    };

    const result = migrateBackup(v3Backup, 3);

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
    expect(result.error).toContain('invalid or corrupted');
  });
});
