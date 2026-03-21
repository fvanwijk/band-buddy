import { describe, expect, it } from 'vitest';
import { migrateV1ToV2 } from './migration';

describe('v1-to-v2 migration', () => {
  it('should transform setlistSongs with setNumber to use setlistSets', () => {
    const v1Backup = {
      tables: {
        instruments: {},
        setlistSongs: {
          '0': { setNumber: 1, setlistId: '1', songId: '1', songIndex: 0 },
          '1': { setNumber: 1, setlistId: '1', songId: '2', songIndex: 1 },
          '2': { setNumber: 2, setlistId: '1', songId: '1', songIndex: 0 },
        },
        setlists: {
          '1': { date: '2024-01-01', title: 'Setlist 1' },
        },
        songs: {
          '1': { artist: 'Artist 1', title: 'Song 1' },
          '2': { artist: 'Artist 2', title: 'Song 2' },
        },
      },
      values: { locale: 'en-US' },
      version: 1,
    };

    const result = migrateV1ToV2(v1Backup);

    // Check setlistSets were created correctly
    expect(Object.keys(result.tables.setlistSets || {})).toHaveLength(2);

    const setlistSets = Object.values(result.tables.setlistSets || {});
    const set1 = setlistSets.find(
      (s: Record<string, unknown>) => s.setlistId === '1' && s.setIndex === 1,
    );
    const set2 = setlistSets.find(
      (s: Record<string, unknown>) => s.setlistId === '1' && s.setIndex === 2,
    );

    expect(set1).toBeDefined();
    expect(set2).toBeDefined();

    // Check setlistSongs now reference setIds
    const newSongs = Object.values(result.tables.setlistSongs || {});
    expect(newSongs).toHaveLength(3);
    for (const song of newSongs) {
      expect(song).toHaveProperty('setId');
      expect(song).toHaveProperty('songId');
      expect(song).toHaveProperty('songIndex');
      expect((song as Record<string, unknown>).setNumber).toBeUndefined();
    }

    // Copy values
    expect(result.values.locale).toBe('en-US');
  });

  it('should handle multiple sets in different setlists', () => {
    const v1Backup = {
      tables: {
        instruments: {},
        setlistSongs: {
          '0': { setNumber: 1, setlistId: '1', songId: '1', songIndex: 0 },
          '1': { setNumber: 1, setlistId: '2', songId: '1', songIndex: 0 },
          '2': { setNumber: 2, setlistId: '2', songId: '1', songIndex: 0 },
        },
        setlists: {
          '1': { date: '2024-01-01', title: 'Setlist 1' },
          '2': { date: '2024-01-02', title: 'Setlist 2' },
        },
        songs: {
          '1': { artist: 'Artist 1', title: 'Song 1' },
        },
      },
      values: {},
      version: 1,
    };

    const result = migrateV1ToV2(v1Backup);

    const setlistSets = Object.values(result.tables.setlistSets || {}) as Record<
      string,
      unknown
    >[];
    const setlist1Sets = setlistSets.filter((s) => s.setlistId === '1');
    const setlist2Sets = setlistSets.filter((s) => s.setlistId === '2');

    expect(setlist1Sets).toHaveLength(1);
    expect(setlist2Sets).toHaveLength(2);
  });

  it('should preserve songs, setlists, and instruments', () => {
    const v1Backup = {
      tables: {
        instruments: {
          '1': { midiInId: 'in1', midiInName: 'In 1', name: 'Piano' },
        },
        setlistSongs: {
          '0': { setNumber: 1, setlistId: '1', songId: '1', songIndex: 0 },
        },
        setlists: {
          '1': {
            date: '2024-01-01',
            title: 'Setlist 1',
            venue: 'Venue A',
          },
        },
        songs: {
          '1': {
            artist: 'Artist 1',
            bpm: 120,
            key: 'C',
            lyrics: 'Some lyrics',
            title: 'Song 1',
          },
        },
      },
      values: { locale: 'en-US', theme: 'dark' },
      version: 1,
    };

    const result = migrateV1ToV2(v1Backup);

    expect(result.tables.songs['1']).toEqual(v1Backup.tables.songs['1']);
    expect(result.tables.setlists['1']).toEqual(v1Backup.tables.setlists['1']);
    expect(result.tables.instruments['1']).toEqual(v1Backup.tables.instruments['1']);
    expect(result.values).toEqual(v1Backup.values);
  });

  it('should handle empty setlistSongs', () => {
    const v1Backup = {
      tables: {
        instruments: {},
        setlistSongs: {},
        setlists: {
          '1': { date: '2024-01-01', title: 'Setlist 1' },
        },
        songs: {
          '1': { artist: 'Artist 1', title: 'Song 1' },
        },
      },
      values: {},
      version: 1,
    };

    const result = migrateV1ToV2(v1Backup);

    expect(result.tables.setlistSets).toEqual({});
    expect(result.tables.setlistSongs).toEqual({});
  });

  it('should throw error on invalid input', () => {
    const invalidBackup = {
      tables: {
        setlistSongs: {
          '0': { setlistId: '1', songId: '1', songIndex: 0 }, // Missing setNumber
        },
      },
      values: {},
      version: 1,
    };

    expect(() => migrateV1ToV2(invalidBackup)).toThrow();
  });
});
