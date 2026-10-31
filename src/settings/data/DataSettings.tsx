import { IconDownload, IconTrash, IconUpload } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import type { Tables, Values } from 'tinybase';
import { useStore } from 'tinybase/ui-react';

import {
  createBackupFile,
  type BackupPayload,
  type SheetMusicFiles,
} from '../../services/backupFile';
import {
  CURRENT_BACKUP_VERSION,
  persistStoreVersion,
} from '../../services/migrations/persistedStoreVersion';
import {
  clearSheetMusic,
  deleteSheetMusic,
  getAllSheetMusicKeys,
  getSheetMusic,
  storeSheetMusic,
} from '../../services/sheetMusicStorage';
import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Grid } from '../Grid';
import { GridCell } from '../GridCell';
import { ImportSummaryDialog, type ImportMode } from './import-summary-dialog/ImportSummaryDialog';

type StatusState = {
  message: string;
  severity: 'error' | 'success';
} | null;

export function DataSettings() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const store = useStore();
  const [status, setStatus] = useState<StatusState>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const handleClearDatabase = async () => {
    if (!store) return;

    try {
      await clearSheetMusic();
    } catch {
      setStatus({ message: 'Failed to clear sheet music.', severity: 'error' });
      return;
    }
    void queryClient.invalidateQueries({ queryKey: ['sheetMusic'] });

    store.transaction(() => {
      store.delTables();
      store.delValues();
    });
    persistStoreVersion(localStorage);

    setStatus({
      message: 'Database cleared successfully.',
      severity: 'success',
    });
  };

  const handleExport = async () => {
    if (!store) return;

    try {
      const payload: BackupPayload = {
        tables: store.getTables(),
        values: store.getValues(),
        version: CURRENT_BACKUP_VERSION,
      };

      // Only sheet music of songs that still exist is exported
      const sheetMusic = new Map<string, Blob>();
      for (const songId of await getAllSheetMusicKeys()) {
        if (!store.hasRow('songs', songId)) continue;
        const file = await getSheetMusic(songId);
        if (file) sheetMusic.set(songId, file);
      }

      const file = await createBackupFile(
        payload,
        sheetMusic,
        new Date().toISOString().slice(0, 10),
      );

      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.download = file.name;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setStatus({ message: 'Failed to export backup.', severity: 'error' });
    }
  };

  const importSheetMusic = async (
    tables: Tables,
    mode: ImportMode,
    sheetMusic: SheetMusicFiles,
  ) => {
    const importedSongs = tables.songs;
    if (!importedSongs) return;

    // Replacing the songs removes the sheet music of songs that are no longer in the library
    if (mode === 'replace') {
      const orphanIds = (await getAllSheetMusicKeys()).filter(
        (songId) => !(songId in importedSongs),
      );
      await Promise.all(orphanIds.map(deleteSheetMusic));
    }

    for (const [songId, data] of sheetMusic) {
      const filename = importedSongs[songId]?.sheetMusicFilename;
      const name = typeof filename === 'string' && filename ? filename : `${songId}.pdf`;
      await storeSheetMusic(
        songId,
        new File([data as Uint8Array<ArrayBuffer>], name, { type: 'application/pdf' }),
      );
    }
    void queryClient.invalidateQueries({ queryKey: ['sheetMusic'] });
  };

  const handleImport = async (
    tables: Tables,
    values: Values | undefined,
    mode: ImportMode,
    sheetMusic: SheetMusicFiles,
  ) => {
    if (!store) return;

    // Sheet music goes first so a storage failure leaves the store untouched
    try {
      await importSheetMusic(tables, mode, sheetMusic);
    } catch {
      setStatus({ message: 'Failed to import sheet music.', severity: 'error' });
      setImportFile(null);
      return;
    }

    store.transaction(() => {
      if (mode === 'replace') {
        // Only touch the selected tables; an empty table can't be set, so delete it first
        Object.entries(tables).forEach(([tableId, table]) => {
          store.delTable(tableId);
          if (Object.keys(table).length > 0) store.setTable(tableId, table);
        });
        if (values) store.setValues(values);
      } else {
        Object.entries(tables).forEach(([tableId, table]) => {
          Object.entries(table).forEach(([rowId, row]) => {
            if (mode === 'deepMerge') {
              store.setPartialRow(tableId, rowId, row);
            } else {
              store.setRow(tableId, rowId, row);
            }
          });
        });
        if (values) store.setPartialValues(values);
      }
    });
    persistStoreVersion(localStorage);

    setStatus({
      message: 'Backup imported successfully.',
      severity: 'success',
    });
    setImportFile(null);
  };

  const handleCancelImport = () => {
    setImportFile(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      e.target.value = '';
    }
  };

  return (
    <Grid>
      <GridCell>
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">Back up your data</h2>
            <p className="text-sm text-slate-400">
              BandBuddy stores everything locally on this device. If you clear app or site data, you
              will lose your songs, setlists, and settings. Exporting a backup is recommended before
              you clear data or switch devices, and you can also share exported files with band
              members to sync your data.
            </p>
            <p className="text-sm text-slate-400">
              Backups that include uploaded sheet music are exported as a zip file; otherwise a
              plain JSON file is used. Importing a backup lets you choose to replace or merge it
              with your current data on this device.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              color="primary"
              iconStart={<IconDownload className="h-4 w-4" />}
              onClick={handleExport}
              type="button"
              variant="outlined"
            >
              Export
            </Button>
            <Button
              color="primary"
              iconStart={<IconUpload className="h-4 w-4" />}
              onClick={handleImportClick}
              type="button"
              variant="outlined"
            >
              Import
            </Button>
            <Button
              color="danger"
              iconStart={<IconTrash className="h-4 w-4" />}
              onClick={() => setIsClearDialogOpen(true)}
              type="button"
              variant="outlined"
            >
              Clear database
            </Button>
          </div>

          <input
            accept="application/json,application/zip,.json,.zip"
            aria-label="Backup file"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />

          {status && (
            <Alert severity={status.severity}>
              <span>{status.message}</span>
            </Alert>
          )}
        </div>
      </GridCell>

      <ImportSummaryDialog file={importFile} onClose={handleCancelImport} onImport={handleImport} />

      <ConfirmDialog
        confirmLabel="Clear database"
        isOpen={isClearDialogOpen}
        message="This permanently removes all songs, setlists, instruments, and settings from this device. Export a backup first if you want to keep your data."
        onClose={() => setIsClearDialogOpen(false)}
        onConfirm={handleClearDatabase}
        title="Clear database"
      />
    </Grid>
  );
}
