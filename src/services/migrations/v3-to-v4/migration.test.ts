import { describe, expect, it } from 'vite-plus/test';

import { migrateV3ToV4 } from './migration';

describe('v3-to-v4 migration', () => {
  it('moves legacy canvas paths to lyrics canvas paths', () => {
    const v3Backup = {
      tables: {
        songs: {
          '1': {
            artist: 'Artist 1',
            canvasPaths: '[{"drawMode":true,"paths":[{"x":1,"y":2}]}]',
            title: 'Song 1',
          },
        },
      },
      values: { locale: 'en-US' },
      version: 3,
    };

    const result = migrateV3ToV4(v3Backup);

    expect(result.values).toEqual(v3Backup.values);
    const row = result.tables.songs?.['1'] as Record<string, unknown>;

    expect(row.canvasPaths).toBeUndefined();
    expect(row.lyricsCanvasPaths).toBe('[{"drawMode":true,"paths":[{"x":1,"y":2}]}]');
  });

  it('keeps existing lyrics canvas paths and removes legacy field', () => {
    const v3Backup = {
      tables: {
        songs: {
          '1': {
            artist: 'Artist 1',
            canvasPaths: '[{"paths":[{"x":1,"y":2}]}]',
            lyricsCanvasPaths: '[{"paths":[{"x":9,"y":9}]}]',
            title: 'Song 1',
          },
        },
      },
      values: {},
      version: 3,
    };

    const result = migrateV3ToV4(v3Backup);
    const row = result.tables.songs?.['1'] as Record<string, unknown>;

    expect(row.canvasPaths).toBeUndefined();
    expect(row.lyricsCanvasPaths).toBe('[{"paths":[{"x":9,"y":9}]}]');
  });

  it('throws on invalid payload', () => {
    const invalidBackup = {
      tables: {
        songs: {
          '1': { title: 'Song 1' },
        },
      },
      version: 2,
    };

    expect(() => migrateV3ToV4(invalidBackup)).toThrow('invalid or corrupted');
  });
});
