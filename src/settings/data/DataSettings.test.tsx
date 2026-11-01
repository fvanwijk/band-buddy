import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { unzipSync, zipSync, strToU8 } from 'fflate';
import type { PropsWithChildren } from 'react';
import type { Tables, Values } from 'tinybase';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { createSongTable } from '../../mocks/songs';
import { CURRENT_BACKUP_VERSION } from '../../services/migrations/persistedStoreVersion';
import {
  getAllSheetMusicKeys,
  getSheetMusic,
  storeSheetMusic,
} from '../../services/sheetMusicStorage';
import { STORE_STORAGE_KEY } from '../../store/store';
import { StoreProvider } from '../../store/StoreProvider';
import { MockQueryClientProvider, getMockStore } from '../../testUtils';
import { DataSettings } from './DataSettings';

const createBackupFile = (tables: Tables, values: Values = {}) =>
  new File([JSON.stringify({ tables, values, version: CURRENT_BACKUP_VERSION })], 'backup.json', {
    type: 'application/json',
  });

// IndexedDB is a browser boundary that jsdom lacks, so back the storage with an in-memory map
const mockSheetMusic = vi.hoisted(() => new Map<string, File>());
vi.mock('../../services/sheetMusicStorage', () => ({
  clearSheetMusic: async () => mockSheetMusic.clear(),
  deleteSheetMusic: async (songId: string) => mockSheetMusic.delete(songId),
  getAllSheetMusicKeys: async () => [...mockSheetMusic.keys()],
  getSheetMusic: async (songId: string) => mockSheetMusic.get(songId) ?? null,
  storeSheetMusic: async (songId: string, file: File) => mockSheetMusic.set(songId, file),
}));

const createPdf = (content: string, name = 'score.pdf') =>
  new File([content], name, { type: 'application/pdf' });

const createBackupZip = (tables: Tables, pdfs: Record<string, string>) =>
  new File(
    [
      zipSync({
        'backup.json': strToU8(
          JSON.stringify({ tables, values: {}, version: CURRENT_BACKUP_VERSION }),
        ),
        ...Object.fromEntries(
          Object.entries(pdfs).map(([id, content]) => [`sheet-music/${id}.pdf`, strToU8(content)]),
        ),
      }) as Uint8Array<ArrayBuffer>,
    ],
    'backup.zip',
    { type: 'application/zip' },
  );

const Wrapper = ({ children }: PropsWithChildren) => (
  <MockQueryClientProvider>
    <StoreProvider>{children}</StoreProvider>
  </MockQueryClientProvider>
);

const getPersisted = () => {
  const [tables, values] = JSON.parse(localStorage.getItem(STORE_STORAGE_KEY) ?? '[{}, {}]') as [
    Tables,
    Values,
  ];
  return { tables, values };
};

describe('DataSettings', () => {
  beforeEach(() => {
    mockSheetMusic.clear();
  });

  const renderComponent = async () => {
    const { persister, store } = getMockStore();
    store.setRow('songs', 'existing', createSongTable({ title: 'Existing song' }));
    store.setRow('songs', 'shared', createSongTable({ notes: 'Keep me', title: 'Old title' }));
    store.setValue('theme', 'orange');
    await persister.save();

    render(<DataSettings />, { wrapper: Wrapper });
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

  it('ignores the Spotify device in backups made before it was kept out of the store', async () => {
    await renderComponent();

    await selectBackup(
      createBackupFile(
        { songs: { imported: createSongTable({ title: 'Imported song' }) } },
        { spotifyDeviceId: 'other-device', theme: 'violet' },
      ),
    );
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Confirm import' })).getByRole('button', {
        name: 'Import',
      }),
    );

    expect(await screen.findByText('Backup imported successfully.')).toBeInTheDocument();
    await waitFor(() => expect(getPersisted().values.theme).toBe('violet'));
    expect(getPersisted().values.spotifyDeviceId).toBeUndefined();
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

  describe('sheet music', () => {
    const confirmImport = async () => {
      await userEvent.click(
        within(screen.getByRole('dialog', { name: 'Confirm import' })).getByRole('button', {
          name: 'Import',
        }),
      );
      expect(await screen.findByText('Backup imported successfully.')).toBeInTheDocument();
    };

    const zipBackup = () =>
      createBackupZip(
        {
          songs: {
            imported: createSongTable({
              sheetMusicFilename: 'imported.pdf',
              title: 'Imported song',
            }),
            shared: createSongTable({ sheetMusicFilename: 'shared.pdf', title: 'New title' }),
          },
        },
        { imported: 'imported pdf', shared: 'shared pdf' },
      );

    const exportBackup = async () => {
      let exported: Blob | undefined;
      let filename = '';
      URL.createObjectURL = vi.fn((blob: Blob) => {
        exported = blob;
        return 'blob:backup';
      });
      URL.revokeObjectURL = vi.fn();
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
        function (this: HTMLAnchorElement) {
          filename = this.download;
        },
      );

      await userEvent.click(screen.getByRole('button', { name: 'Export' }));
      await waitFor(() => expect(exported).toBeDefined());
      return { blob: exported as Blob, filename };
    };

    it('exports plain JSON when there is no sheet music', async () => {
      await renderComponent();

      const { blob, filename } = await exportBackup();

      expect(filename).toMatch(/^band-buddy-backup-\d{4}-\d{2}-\d{2}\.json$/);
      expect(JSON.parse(await blob.text()).tables.songs.existing).toBeDefined();
    });

    it('exports a zip with the sheet music of existing songs', async () => {
      await renderComponent();
      await storeSheetMusic('existing', createPdf('existing pdf'));
      await storeSheetMusic('deleted', createPdf('orphan pdf'));

      const { blob, filename } = await exportBackup();

      expect(filename).toMatch(/\.zip$/);
      const entries = unzipSync(new Uint8Array(await blob.arrayBuffer()));
      expect(Object.keys(entries).toSorted()).toEqual(['backup.json', 'sheet-music/existing.pdf']);
      expect(new TextDecoder().decode(entries['sheet-music/existing.pdf'])).toBe('existing pdf');
      expect(
        JSON.parse(new TextDecoder().decode(entries['backup.json'])).tables.songs.shared,
      ).toBeDefined();
    });

    it('shows the number of included PDFs when importing a zip', async () => {
      await renderComponent();

      await selectBackup(zipBackup());

      expect(screen.getByText('2 sheet music PDFs included')).toBeInTheDocument();
      expect(screen.queryByText(/not included in this backup/)).not.toBeInTheDocument();
    });

    it('warns when a zip lacks the sheet music of some songs', async () => {
      await renderComponent();

      await selectBackup(
        createBackupZip(
          {
            songs: {
              imported: createSongTable({ sheetMusicFilename: 'imported.pdf' }),
              missing: createSongTable({ sheetMusicFilename: 'missing.pdf' }),
            },
          },
          { imported: 'imported pdf' },
        ),
      );

      expect(
        screen.getByText('1 song refers to sheet music that is not included in this backup.'),
      ).toBeInTheDocument();
    });

    it('imports the PDFs from a zip and removes those of replaced songs', async () => {
      await renderComponent();
      await storeSheetMusic('existing', createPdf('old pdf'));
      await selectBackup(zipBackup());

      await confirmImport();

      await waitFor(async () =>
        expect((await getAllSheetMusicKeys()).toSorted()).toEqual(['imported', 'shared']),
      );
      const imported = await getSheetMusic('imported');
      expect(imported?.name).toBe('imported.pdf');
      expect(imported?.type).toBe('application/pdf');
      expect(await imported?.text()).toBe('imported pdf');
    });

    it('keeps existing PDFs when merging', async () => {
      await renderComponent();
      await storeSheetMusic('existing', createPdf('old pdf'));
      await selectBackup(zipBackup());

      await userEvent.click(screen.getByRole('radio', { name: 'Merge' }));
      await confirmImport();

      await waitFor(async () =>
        expect((await getAllSheetMusicKeys()).toSorted()).toEqual([
          'existing',
          'imported',
          'shared',
        ]),
      );
    });

    it('does not import PDFs when songs are not selected', async () => {
      await renderComponent();
      await storeSheetMusic('existing', createPdf('old pdf'));
      await selectBackup(zipBackup());

      await userEvent.click(screen.getByRole('checkbox', { name: 'Songs' }));
      await confirmImport();

      expect(await getAllSheetMusicKeys()).toEqual(['existing']);
    });

    it('keeps the existing PDF of a song when the backup has none for it', async () => {
      await renderComponent();
      await storeSheetMusic('shared', createPdf('local pdf'));
      await selectBackup(importedBackup());

      await confirmImport();

      expect(await (await getSheetMusic('shared'))?.text()).toBe('local pdf');
    });

    it('rejects a zip without backup.json', async () => {
      await renderComponent();

      await userEvent.upload(
        screen.getByLabelText('Backup file'),
        new File([zipSync({ 'other.txt': strToU8('x') }) as Uint8Array<ArrayBuffer>], 'backup.zip'),
      );

      expect(await screen.findByText('Invalid backup format.')).toBeInTheDocument();
    });

    it('removes all sheet music when clearing the database', async () => {
      await renderComponent();
      await storeSheetMusic('existing', createPdf('old pdf'));

      await userEvent.click(screen.getByRole('button', { name: 'Clear database' }));
      const dialog = await screen.findByRole('dialog', { name: 'Clear database' });
      await userEvent.click(within(dialog).getByRole('button', { name: 'Clear database' }));

      expect(await screen.findByText('Database cleared successfully.')).toBeInTheDocument();
      expect(await getAllSheetMusicKeys()).toEqual([]);
    });
  });
});
