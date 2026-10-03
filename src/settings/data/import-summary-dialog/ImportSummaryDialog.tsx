import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { Tables, Values } from 'tinybase';

import { migrateBackup } from '../../../services/migrations';
import { Alert } from '../../../ui/Alert';
import { Button } from '../../../ui/Button';
import { Dialog } from '../../../ui/Dialog';
import { ImportSummarySection } from './ImportSummarySection';

type BackupPayload = {
  tables: Tables;
  version: number;
  values: Values;
};

type ImportSummaryDialogProps = {
  file: File | null;
  onClose: () => void;
  onImport: (tables: Tables, values: Values) => void;
};

const getCellAsString = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value ? value : fallback;

export const ImportSummaryDialog: FC<ImportSummaryDialogProps> = ({ file, onClose, onImport }) => {
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<{ tables: Tables; values: Values } | null>(null);

  useEffect(() => {
    if (!file) {
      setError(null);
      setParsed(null);
      return;
    }

    let cancelled = false;

    const parseFile = async () => {
      try {
        const text = await file.text();
        const payload = JSON.parse(text) as Partial<BackupPayload>;

        if (!payload.tables || !payload.values || typeof payload.version !== 'number') {
          throw new Error('Invalid backup format.');
        }

        const migrationResult = migrateBackup(payload, payload.version);

        if (cancelled) return;

        if (migrationResult.error) {
          setError(migrationResult.error);
          return;
        }

        setParsed({ tables: migrationResult.tables, values: migrationResult.values });
      } catch (parseError) {
        if (cancelled) return;

        const message =
          parseError instanceof Error ? parseError.message : 'Failed to import backup.';
        setError(message);
      }
    };

    void parseFile();

    return () => {
      cancelled = true;
    };
  }, [file]);

  const handleConfirm = () => {
    if (!parsed) return;
    onImport(parsed.tables, parsed.values);
  };

  const songs = Object.values(parsed?.tables.songs ?? {});
  const instruments = Object.values(parsed?.tables.instruments ?? {});
  const setlists = Object.values(parsed?.tables.setlists ?? {});

  return (
    <Dialog onClose={onClose} open={!!file} title="Confirm import">
      {error && (
        <>
          <Alert severity="error">
            <span>{error}</span>
          </Alert>
          <Button className="mt-4 w-full" onClick={onClose} type="button" variant="outlined">
            Close
          </Button>
        </>
      )}

      {!error && parsed && (
        <>
          <p className="mb-4 text-sm text-slate-400">
            This backup contains the following data. Importing it will replace your current data on
            this device.
          </p>

          <div className="mb-6 space-y-4 text-sm text-slate-100">
            <ImportSummarySection count={songs.length} label="Songs" />
            <ImportSummarySection
              count={instruments.length}
              items={instruments.map((instrument) =>
                getCellAsString(instrument.name, 'Unnamed instrument'),
              )}
              label="Instruments"
            />
            <ImportSummarySection
              count={setlists.length}
              items={setlists.map((setlist) => getCellAsString(setlist.title, 'Untitled setlist'))}
              label="Setlists"
            />
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={onClose} type="button" variant="outlined">
              Cancel
            </Button>
            <Button
              autoFocus
              className="flex-1"
              color="primary"
              onClick={handleConfirm}
              type="button"
              variant="filled"
            >
              Import
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
};
