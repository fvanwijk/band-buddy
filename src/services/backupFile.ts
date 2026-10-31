import { strToU8, unzipSync, zipSync } from 'fflate';
import type { Tables, Values } from 'tinybase';

export type BackupPayload = {
  tables: Tables;
  values: Values;
  version: number;
};

// Sheet music PDFs by song ID
export type SheetMusicFiles = Map<string, Uint8Array>;

export type ParsedBackup = {
  payload: Partial<BackupPayload>;
  sheetMusic: SheetMusicFiles;
};

const BACKUP_ENTRY = 'backup.json';
const SHEET_MUSIC_DIR = 'sheet-music/';
const SHEET_MUSIC_ENTRY = /^sheet-music\/([^/]+)\.pdf$/;

// Zip archives start with "PK\x03\x04"; legacy JSON backups start with "{" (optionally after whitespace/BOM)
const isZip = (bytes: Uint8Array) =>
  bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;

// TextDecoder strips a leading BOM, which JSON.parse would reject
const parseJson = (bytes: Uint8Array) =>
  JSON.parse(new TextDecoder().decode(bytes)) as Partial<BackupPayload>;

/**
 * Without sheet music the backup stays a plain JSON file (the legacy format).
 * With sheet music it becomes a zip with `backup.json` and `sheet-music/<songId>.pdf`.
 */
export async function createBackupFile(
  payload: BackupPayload,
  sheetMusic: Map<string, Blob>,
  date: string,
): Promise<File> {
  const baseName = `band-buddy-backup-${date}`;
  const json = JSON.stringify(payload);

  if (sheetMusic.size === 0) {
    return new File([json], `${baseName}.json`, { type: 'application/json' });
  }

  const entries: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {
    [BACKUP_ENTRY]: strToU8(json),
  };
  for (const [songId, blob] of sheetMusic) {
    // PDFs are already compressed, so store them as is
    entries[`${SHEET_MUSIC_DIR}${songId}.pdf`] = [
      new Uint8Array(await blob.arrayBuffer()),
      { level: 0 },
    ];
  }

  return new File([zipSync(entries) as Uint8Array<ArrayBuffer>], `${baseName}.zip`, {
    type: 'application/zip',
  });
}

export async function parseBackupFile(file: File): Promise<ParsedBackup> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (!isZip(bytes)) {
    return { payload: parseJson(bytes), sheetMusic: new Map() };
  }

  const entries = unzipSync(bytes, {
    filter: ({ name }) => name === BACKUP_ENTRY || SHEET_MUSIC_ENTRY.test(name),
  });

  const backupJson = entries[BACKUP_ENTRY];
  if (!backupJson) {
    throw new Error('Invalid backup format.');
  }

  const sheetMusic: SheetMusicFiles = new Map();
  for (const [name, data] of Object.entries(entries)) {
    const songId = SHEET_MUSIC_ENTRY.exec(name)?.[1];
    if (songId) sheetMusic.set(songId, data);
  }

  return { payload: parseJson(backupJson), sheetMusic };
}
