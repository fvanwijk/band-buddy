import type { Tables } from 'tinybase';
import { describe, expect, it } from 'vite-plus/test';

import {
  CURRENT_BACKUP_VERSION,
  inferLegacyPersistedStoreVersion,
  parsePersistedStoreVersion,
  resolvePersistedStoreVersion,
} from './persistedStoreVersion';

describe('persistedStoreVersion', () => {
  it('parses a valid stored version', () => {
    expect(parsePersistedStoreVersion('3')).toBe(3);
  });

  it('returns null for invalid stored versions', () => {
    expect(parsePersistedStoreVersion(null)).toBeNull();
    expect(parsePersistedStoreVersion('abc')).toBeNull();
    expect(parsePersistedStoreVersion('0')).toBeNull();
  });

  it('prefers explicit version metadata over inference', () => {
    const tables = {
      setlistSongs: {
        '1_1_0': { songId: '1', songIndex: 0 },
      },
    } as unknown as Tables;

    expect(resolvePersistedStoreVersion('3', tables)).toBe(3);
  });

  it('falls back to legacy inference when no version is stored', () => {
    const tables = {
      setlistSongs: {
        '1_1_0': { songId: '1', songIndex: 0 },
      },
    } as unknown as Tables;

    expect(inferLegacyPersistedStoreVersion(tables)).toBe(1);
    expect(resolvePersistedStoreVersion(null, tables)).toBe(1);
  });

  it('defaults to current version for non-legacy data', () => {
    const tables = {
      setlistSets: { '0': { setIndex: 1, setlistId: '1' } },
      setlistSongs: { '0': { setId: '0', songId: '1', songIndex: 0 } },
    } as unknown as Tables;

    expect(inferLegacyPersistedStoreVersion(tables)).toBe(CURRENT_BACKUP_VERSION);
  });

  it('infers v2 when songs still use single-action MIDI button shape', () => {
    const tables = {
      setlistSets: { '0': { setIndex: 1, setlistId: '1' } },
      setlistSongs: { '0': { setId: '0', songId: '1', songIndex: 0 } },
      songs: {
        '1': {
          midiEvents: '[{"id":"midi-1","instrumentId":"0","label":"Organ","programChange":12}]',
        },
      },
    } as unknown as Tables;

    expect(inferLegacyPersistedStoreVersion(tables)).toBe(2);
  });
});
