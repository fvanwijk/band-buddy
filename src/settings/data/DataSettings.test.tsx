import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Tables, Values } from 'tinybase';
import { describe, expect, it } from 'vite-plus/test';

import { createSongTable } from '../../mocks/songs';
import { CURRENT_BACKUP_VERSION } from '../../services/migrations/persistedStoreVersion';
import { STORE_STORAGE_KEY } from '../../store/store';
import { StoreProvider } from '../../store/StoreProvider';
import { getMockStore } from '../../testUtils';
import { DataSettings } from './DataSettings';

const createBackupFile = (tables: Tables, values: Values = {}) =>
  new File([JSON.stringify({ tables, values, version: CURRENT_BACKUP_VERSION })], 'backup.json', {
    type: 'application/json',
  });

const getPersisted = () => {
  const [tables, values] = JSON.parse(localStorage.getItem(STORE_STORAGE_KEY) ?? '[{}, {}]') as [
    Tables,
    Values,
  ];
  return { tables, values };
};

describe('DataSettings', () => {
  const renderComponent = async () => {
    const { persister, store } = getMockStore();
    store.setRow('songs', 'existing', createSongTable({ title: 'Existing song' }));
    store.setRow('songs', 'shared', createSongTable({ notes: 'Keep me', title: 'Old title' }));
    store.setValue('theme', 'orange');
    await persister.save();

    render(<DataSettings />, { wrapper: StoreProvider });
    await screen.findByRole('button', { name: 'Import' });
  };

  const selectBackup = async (file: File) => {
    await userEvent.upload(screen.getByLabelText('Backup file'), file);
    await screen.findByRole('dialog', { name: 'Confirm import' });
    await screen.findByText('Songs');
  };

  const importedBackup = () =>
    createBackupFile(
      {
        songs: {
          imported: createSongTable({ title: 'Imported song' }),
          shared: createSongTable({ notes: undefined, title: 'New title' }),
        },
      },
      { theme: 'violet' },
    );

  it('does not import before the user confirms', async () => {
    await renderComponent();

    await selectBackup(importedBackup());

    expect(Object.keys(getPersisted().tables.songs)).toEqual(['existing', 'shared']);
  });

  it('imports nothing when the dialog is cancelled', async () => {
    await renderComponent();
    await selectBackup(importedBackup());

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(Object.keys(getPersisted().tables.songs)).toEqual(['existing', 'shared']);
    expect(screen.queryByText('Backup imported successfully.')).not.toBeInTheDocument();
  });

  it('replaces all current data by default', async () => {
    await renderComponent();
    await selectBackup(importedBackup());

    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Confirm import' })).getByRole('button', {
        name: 'Import',
      }),
    );

    expect(await screen.findByText('Backup imported successfully.')).toBeInTheDocument();
    await waitFor(() =>
      expect(Object.keys(getPersisted().tables.songs).toSorted()).toEqual(['imported', 'shared']),
    );
    expect(getPersisted().tables.songs.shared.title).toBe('New title');
    expect(getPersisted().values.theme).toBe('violet');
  });

  it('only replaces the data that is selected', async () => {
    await renderComponent();
    await selectBackup(importedBackup());

    await userEvent.click(screen.getByRole('checkbox', { name: 'Songs' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Settings' }));
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Confirm import' })).getByRole('button', {
        name: 'Import',
      }),
    );

    expect(await screen.findByText('Backup imported successfully.')).toBeInTheDocument();
    expect(Object.keys(getPersisted().tables.songs)).toEqual(['existing', 'shared']);
    expect(getPersisted().tables.songs.shared.title).toBe('Old title');
    expect(getPersisted().values.theme).toBe('orange');
  });

  it('merges rows and replaces matching rows entirely', async () => {
    await renderComponent();
    await selectBackup(importedBackup());

    await userEvent.click(screen.getByRole('radio', { name: 'Merge' }));
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Confirm import' })).getByRole('button', {
        name: 'Import',
      }),
    );

    await waitFor(() =>
      expect(Object.keys(getPersisted().tables.songs).toSorted()).toEqual([
        'existing',
        'imported',
        'shared',
      ]),
    );
    expect(getPersisted().tables.songs.shared.title).toBe('New title');
    expect(getPersisted().tables.songs.shared.notes).toBeUndefined();
    expect(getPersisted().values.theme).toBe('violet');
  });

  it('merges matching rows cell by cell with deep merge', async () => {
    await renderComponent();
    await selectBackup(importedBackup());

    await userEvent.click(screen.getByRole('radio', { name: 'Deep merge' }));
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Confirm import' })).getByRole('button', {
        name: 'Import',
      }),
    );

    await waitFor(() => expect(getPersisted().tables.songs.shared.title).toBe('New title'));
    expect(getPersisted().tables.songs.shared.notes).toBe('Keep me');
    expect(getPersisted().tables.songs.existing.title).toBe('Existing song');
  });

  it('shows an error and keeps the data when the file is not a valid backup', async () => {
    await renderComponent();

    await userEvent.upload(
      screen.getByLabelText('Backup file'),
      new File(['{"nope": true}'], 'backup.json', { type: 'application/json' }),
    );

    expect(await screen.findByText('Invalid backup format.')).toBeInTheDocument();
    expect(Object.keys(getPersisted().tables.songs)).toEqual(['existing', 'shared']);
  });

  it('keeps the data when clearing the database is cancelled', async () => {
    await renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Clear database' }));
    const dialog = await screen.findByRole('dialog', { name: 'Clear database' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(Object.keys(getPersisted().tables.songs)).toEqual(['existing', 'shared']);
  });

  it('clears the database after confirmation', async () => {
    await renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Clear database' }));
    const dialog = await screen.findByRole('dialog', { name: 'Clear database' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Clear database' }));

    expect(await screen.findByText('Database cleared successfully.')).toBeInTheDocument();
    await waitFor(() => expect(getPersisted().tables.songs).toBeUndefined());
  });
});
