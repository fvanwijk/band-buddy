import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Tables, Values } from 'tinybase';
import { useStore } from 'tinybase/ui-react';

import { SUPPORTED_LOCALES } from '../../../config/locales';
import { THEMES, type ThemeName } from '../../../config/themes';
import { migrateBackup } from '../../../services/migrations';
import { Alert } from '../../../ui/Alert';
import { Button } from '../../../ui/Button';
import { Dialog } from '../../../ui/Dialog';
import { RadioGroup } from '../../../ui/form/RadioGroup';
import { ImportSettingsSection } from './ImportSettingsSection';
import { ImportSummarySection } from './ImportSummarySection';

type BackupPayload = {
  tables: Tables;
  version: number;
  values: Values;
};

export type ImportMode = 'deepMerge' | 'merge' | 'replace';

type ImportFormData = {
  mode: ImportMode;
};

type ImportSummaryDialogProps = {
  file: File | null;
  onClose: () => void;
  onImport: (tables: Tables, values: Values, mode: ImportMode) => void;
};

const modeOptions = [
  {
    description: 'Delete all current data and use only the backup.',
    label: 'Replace',
    value: 'replace',
  },
  {
    description: 'Keep current data and add the backup. Rows with the same ID are overwritten.',
    label: 'Merge',
    value: 'merge',
  },
  {
    description:
      'Keep current data and add the backup. Rows with the same ID are combined field by field.',
    label: 'Deep merge',
    value: 'deepMerge',
  },
];

const getCellAsString = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value ? value : fallback;

export const ImportSummaryDialog: FC<ImportSummaryDialogProps> = ({ file, onClose, onImport }) => {
  const store = useStore();
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<{ tables: Tables; values: Values } | null>(null);
  const { register, reset, watch } = useForm<ImportFormData>({
    defaultValues: { mode: 'replace' },
  });
  const mode = watch('mode');

  useEffect(() => {
    if (!file) {
      setError(null);
      setParsed(null);
      reset();
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
    onImport(parsed.tables, parsed.values, mode);
  };

  const songs = Object.values(parsed?.tables.songs ?? {});
  const instruments = Object.values(parsed?.tables.instruments ?? {});
  const setlists = Object.values(parsed?.tables.setlists ?? {});

  const settings: { label: string; value: string }[] = [];
  const { locale, theme } = parsed?.values ?? {};
  if (typeof locale === 'string') {
    settings.push({
      label: 'Language',
      value: SUPPORTED_LOCALES.find((l) => l.locale === locale)?.name ?? locale,
    });
  }
  if (typeof theme === 'string') {
    settings.push({ label: 'Color theme', value: THEMES[theme as ThemeName]?.name ?? theme });
  }

  const getMatchLabel = (tableId: string) => {
    if (mode === 'replace' || !store) return undefined;
    const matches = Object.keys(parsed?.tables[tableId] ?? {}).filter((rowId) =>
      store.hasRow(tableId, rowId),
    ).length;
    return mode === 'deepMerge' ? `${matches} already existing` : `${matches} will be replaced`;
  };

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
          <p className="mb-4 text-sm text-slate-400">This backup contains the following data.</p>

          <div className="mb-4 space-y-4 text-sm text-slate-100">
            <ImportSummarySection
              count={songs.length}
              label="Songs"
              matchLabel={getMatchLabel('songs')}
            />
            <ImportSummarySection
              count={setlists.length}
              items={setlists.map((setlist) => getCellAsString(setlist.title, 'Untitled setlist'))}
              label="Setlists"
              matchLabel={getMatchLabel('setlists')}
            />
            <ImportSummarySection
              count={instruments.length}
              items={instruments.map((instrument) =>
                getCellAsString(instrument.name, 'Unnamed instrument'),
              )}
              label="Instruments"
              matchLabel={getMatchLabel('instruments')}
            />
            {settings.length > 0 && <ImportSettingsSection settings={settings} />}
          </div>

          <RadioGroup
            className="mb-6"
            label="Import mode"
            options={modeOptions}
            register={register('mode')}
            vertical
          />

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
