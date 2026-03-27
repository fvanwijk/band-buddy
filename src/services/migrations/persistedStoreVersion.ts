import type { Tables } from 'tinybase';

export const CURRENT_BACKUP_VERSION = 2;
export const PERSISTED_STORE_VERSION_KEY = 'band-buddy-version';

// Legacy installs persisted Tinybase data without a separate version key.
// Keep this inference isolated so we can remove it once all active stores write raw version metadata.
export function inferLegacyPersistedStoreVersion(tables: Tables): number {
  const setlistSongs = tables.setlistSongs;
  if (!setlistSongs) {
    return CURRENT_BACKUP_VERSION;
  }

  const hasLegacySetNumber = Object.values(setlistSongs).some(
    (song) => typeof song === 'object' && song !== null && 'setNumber' in song,
  );

  return hasLegacySetNumber ? 1 : CURRENT_BACKUP_VERSION;
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
