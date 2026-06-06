import type { Tables } from 'tinybase';

export const CURRENT_BACKUP_VERSION = 3;
export const PERSISTED_STORE_VERSION_KEY = 'band-buddy-version';

// Legacy installs persisted Tinybase data without a separate version key.
// Keep this inference isolated so we can remove it once all active stores write raw version metadata.
export function inferLegacyPersistedStoreVersion(tables: Tables): number {
  const setlistSongs = tables.setlistSongs;
  if (!setlistSongs) {
    return CURRENT_BACKUP_VERSION;
  }

  // v2 setlistSong rows have a 'setId' field; v1 rows only have 'songId' and 'songIndex'.
  const hasV2SetId = Object.values(setlistSongs).some(
    (song) => typeof song === 'object' && song !== null && 'setId' in song,
  );

  if (!hasV2SetId) {
    return 1;
  }

  const songs = tables.songs;
  if (!songs) {
    return CURRENT_BACKUP_VERSION;
  }

  const hasV2MidiShape = Object.values(songs).some((song) => {
    if (typeof song !== 'object' || song === null) {
      return false;
    }

    const midiEvents = (song as Record<string, unknown>).midiEvents;
    if (typeof midiEvents !== 'string') {
      return false;
    }

    try {
      const parsed = JSON.parse(midiEvents);
      if (!Array.isArray(parsed)) {
        return false;
      }

      return parsed.some((event) => {
        if (typeof event !== 'object' || event === null) {
          return false;
        }

        const typedEvent = event as Record<string, unknown>;
        return (
          typeof typedEvent.instrumentId === 'string' &&
          typeof typedEvent.programChange === 'number' &&
          !Array.isArray(typedEvent.events)
        );
      });
    } catch {
      return false;
    }
  });

  return hasV2MidiShape ? 2 : CURRENT_BACKUP_VERSION;
}

export function parsePersistedStoreVersion(input: string | null): number | null {
  if (!input) {
    return null;
  }

  const version = Number.parseInt(input, 10);
  if (Number.isNaN(version) || version < 1) {
    return null;
  }

  return version;
}

export function persistStoreVersion(
  storage: Pick<Storage, 'setItem'>,
  version = CURRENT_BACKUP_VERSION,
) {
  storage.setItem(PERSISTED_STORE_VERSION_KEY, String(version));
}

export function resolvePersistedStoreVersion(rawVersion: string | null, tables: Tables): number {
  return parsePersistedStoreVersion(rawVersion) ?? inferLegacyPersistedStoreVersion(tables);
}
