import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Tables, Values } from 'tinybase';
import { describe, expect, it, vi } from 'vite-plus/test';

import { createInstrumentTable } from '../../../mocks/instruments';
import { createSetlistTable } from '../../../mocks/setlists';
import { createSongTable } from '../../../mocks/songs';
import { CURRENT_BACKUP_VERSION } from '../../../services/migrations/persistedStoreVersion';
import { StoreProvider } from '../../../store/StoreProvider';
import { getMockStore } from '../../../testUtils';
import { ImportSummaryDialog } from './ImportSummaryDialog';

const backup: { tables: Tables; values: Values; version: number } = {
  tables: {
    instruments: { i1: createInstrumentTable({ name: 'Nord Stage 4' }) },
    setlists: {
      l1: createSetlistTable({ title: 'Summer Tour' }),
      l2: createSetlistTable({ title: 'Winter Gigs' }),
    },
    songs: {
      s1: createSongTable({ title: 'Bohemian Rhapsody' }),
      s2: createSongTable({ title: 'Superstition' }),
      s3: createSongTable({ title: 'September' }),
    },
  },
  values: { locale: 'nl-NL', theme: 'violet' },
  version: CURRENT_BACKUP_VERSION,
};

const createBackupFile = (payload: unknown = backup) =>
  new File([JSON.stringify(payload)], 'backup.json', { type: 'application/json' });

describe('ImportSummaryDialog', () => {
  const renderComponent = async ({
    file = createBackupFile(),
    onClose = () => {},
    onImport = () => {},
  }: {
    file?: File | null;
    onClose?: () => void;
    onImport?: (tables: Tables, values: Values, replace: boolean, deepMerge: boolean) => void;
  } = {}) => {
    const { persister, store } = getMockStore();
    // Only s1 exists in the current data, so the backup has exactly one matching song
    store.setRow('songs', 's1', createSongTable({ title: 'Old title' }));
    await persister.save();

    render(<ImportSummaryDialog file={file} onClose={onClose} onImport={onImport} />, {
      wrapper: StoreProvider,
    });
  };

  const getSection = (label: string) => screen.getByText(label).parentElement as HTMLElement;

  it('renders nothing without a file', async () => {
    await renderComponent({ file: null });

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('summarizes the songs, setlists, instruments and settings in the backup', async () => {
    await renderComponent();

    expect(await screen.findByRole('dialog', { name: 'Confirm import' })).toBeInTheDocument();
    expect(await screen.findByText('Nord Stage 4')).toBeInTheDocument();
    expect(getSection('Songs')).toHaveTextContent('3');
    expect(getSection('Instruments')).toHaveTextContent('1');
    expect(getSection('Setlists')).toHaveTextContent('2');
    expect(screen.getByText('Summer Tour')).toBeInTheDocument();
    expect(screen.getByText('Winter Gigs')).toBeInTheDocument();
    expect(screen.getByText('🇳🇱 Nederlands')).toBeInTheDocument();
    expect(screen.getByText('Violet')).toBeInTheDocument();
  });

  it('does not list individual songs', async () => {
    await renderComponent();

    await screen.findByText('Nord Stage 4');

    expect(screen.queryByText('Bohemian Rhapsody')).not.toBeInTheDocument();
  });

  it('omits the settings section when the backup has no general settings', async () => {
    await renderComponent({ file: createBackupFile({ ...backup, values: {} }) });

    await screen.findByText('Nord Stage 4');

    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('shows an error for an invalid backup and lets the user close the dialog', async () => {
    const onClose = vi.fn();
    await renderComponent({ file: createBackupFile({ tables: {} }), onClose });

    expect(await screen.findByText('Invalid backup format.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Import' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows an error for a backup that is newer than the app', async () => {
    await renderComponent({
      file: createBackupFile({ ...backup, version: CURRENT_BACKUP_VERSION + 1 }),
    });

    expect(await screen.findByText(/is newer than app version/)).toBeInTheDocument();
  });

  it('defaults to replacing without showing matches or the deep merge option', async () => {
    await renderComponent();

    await screen.findByText('Nord Stage 4');

    expect(screen.getByRole('radio', { name: 'Replace all current data' })).toBeChecked();
    expect(screen.queryByText(/will be replaced/)).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('shows how many rows will be replaced when merging', async () => {
    await renderComponent();
    await screen.findByText('Nord Stage 4');

    await userEvent.click(screen.getByRole('radio', { name: 'Merge with current data' }));

    expect(within(getSection('Songs')).getByText('1 will be replaced')).toBeInTheDocument();
    expect(within(getSection('Instruments')).getByText('0 will be replaced')).toBeInTheDocument();
    expect(within(getSection('Setlists')).getByText('0 will be replaced')).toBeInTheDocument();
  });

  it('shows how many rows already exist when deep merging', async () => {
    await renderComponent();
    await screen.findByText('Nord Stage 4');

    await userEvent.click(screen.getByRole('radio', { name: 'Merge with current data' }));
    await userEvent.click(screen.getByRole('checkbox', { name: /Deep merge/ }));

    expect(within(getSection('Songs')).getByText('1 already existing')).toBeInTheDocument();
    expect(screen.queryByText(/will be replaced/)).not.toBeInTheDocument();
  });

  it('hides the deep merge option again when switching back to replace', async () => {
    await renderComponent();
    await screen.findByText('Nord Stage 4');

    await userEvent.click(screen.getByRole('radio', { name: 'Merge with current data' }));
    expect(screen.getByRole('checkbox', { name: /Deep merge/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Replace all current data' }));

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('imports with replace by default', async () => {
    const onImport = vi.fn();
    await renderComponent({ onImport });
    await screen.findByText('Nord Stage 4');

    await userEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(onImport).toHaveBeenCalledWith(backup.tables, backup.values, true, false);
  });

  it('imports with a shallow merge', async () => {
    const onImport = vi.fn();
    await renderComponent({ onImport });
    await screen.findByText('Nord Stage 4');

    await userEvent.click(screen.getByRole('radio', { name: 'Merge with current data' }));
    await userEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(onImport).toHaveBeenCalledWith(backup.tables, backup.values, false, false);
  });

  it('imports with a deep merge', async () => {
    const onImport = vi.fn();
    await renderComponent({ onImport });
    await screen.findByText('Nord Stage 4');

    await userEvent.click(screen.getByRole('radio', { name: 'Merge with current data' }));
    await userEvent.click(screen.getByRole('checkbox', { name: /Deep merge/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(onImport).toHaveBeenCalledWith(backup.tables, backup.values, false, true);
  });

  it('does not use deep merge when it was checked before switching back to replace', async () => {
    const onImport = vi.fn();
    await renderComponent({ onImport });
    await screen.findByText('Nord Stage 4');

    await userEvent.click(screen.getByRole('radio', { name: 'Merge with current data' }));
    await userEvent.click(screen.getByRole('checkbox', { name: /Deep merge/ }));
    await userEvent.click(screen.getByRole('radio', { name: 'Replace all current data' }));
    await userEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(onImport).toHaveBeenCalledWith(backup.tables, backup.values, true, false);
  });

  it('calls onClose without importing when cancelled', async () => {
    const onClose = vi.fn();
    const onImport = vi.fn();
    await renderComponent({ onClose, onImport });
    await screen.findByText('Nord Stage 4');

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onImport).not.toHaveBeenCalled();
  });
});
