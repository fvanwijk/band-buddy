import { IconDownload, IconUpload } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import type { Tables, Values } from 'tinybase';
import { useStore } from 'tinybase/ui-react';

import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import { SettingsCard } from '../SettingsCard';

type BackupPayload = {
  tables: Tables;
  version: number;
  values: Values;
};

const BACKUP_VERSION = 1;

type StatusState = {
  message: string;
  severity: 'error' | 'success';
} | null;

export function DataSettings() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const store = useStore();
  const [status, setStatus] = useState<StatusState>(null);

  const handleExport = () => {
    if (!store) return;

    const payload: BackupPayload = {
      tables: store.getTables(),
      values: store.getValues(),
      version: BACKUP_VERSION,
    };

    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `band-buddy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    if (!store) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<BackupPayload>;

      if (!parsed.tables || !parsed.values || typeof parsed.version !== 'number') {
        throw new Error('Invalid backup format.');
      }

      if (parsed.version !== BACKUP_VERSION) {
        throw new Error(
          `Unsupported backup version ${parsed.version}. Expected ${BACKUP_VERSION}.`,
        );
      }

      store.setTables(parsed.tables as Tables);
      store.setValues(parsed.values as Values);

      setStatus({
        message: 'Backup imported successfully.',
        severity: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import backup.';
      setStatus({
        message,
        severity: 'error',
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImport(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SettingsCard>
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
              Importing a backup replaces your current data on this device.
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
          </div>

          <input
            accept="application/json"
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
      </SettingsCard>
    </div>
  );
}
