import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { createRoutesStub } from 'react-router-dom';
import { describe, expect, it } from 'vite-plus/test';

import { seedSetlists, seedSetlistSets, seedSetlistSongs, seedSongs } from '../mocks/seed';
import { StoreProvider } from '../store/StoreProvider';
import { getMockStore } from '../testUtils';
import { ManageSongsPage } from './ManageSongsPage';

describe('ManageSongsPage', () => {
  const renderComponent = () =>
    render(<ManageSongsPage />, {
      wrapper: ({ children }) => {
        const RoutesStub = createRoutesStub([{ Component: () => children, path: '/songs' }]);

        return (
          <StoreProvider>
            <RoutesStub initialEntries={['/songs']} />
          </StoreProvider>
        );
      },
    });

  const seedAndRender = async () => {
    const { persister, store } = getMockStore();
    seedSongs(store);
    seedSetlists(store);
    seedSetlistSets(store);
    seedSetlistSongs(store);
    await persister.save();

    const result = renderComponent();
    await screen.findByRole('table');

    return result;
  };

  // Cards and table are both in the DOM in jsdom, so scope to the table
  const getTable = async () => within(await screen.findByRole('table'));
  const getTitles = async () =>
    (await getTable())
      .getAllByRole('row')
      .slice(1)
      .map((row) => within(row).getAllByRole('cell')[0].textContent);

  const addFilter = async (user: UserEvent, name: string) => {
    await user.click(screen.getByRole('button', { name: 'Add filter' }));
    await user.click(await screen.findByRole('menuitem', { name }));
  };

  it('renders an empty state without songs', async () => {
    renderComponent();

    expect(await screen.findByRole('heading', { name: 'No songs in your library' })).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders all songs in the table, sorted by title', async () => {
    await seedAndRender();

    const titles = await getTitles();

    expect(titles).toHaveLength(10);
    expect(titles[0]).toBe('Billie Jean');
    expect(titles[9]).toBe('Superstition');
    expect(screen.getByText('Showing 10 of 10 songs')).toBeInTheDocument();
  });

  describe('sorting', () => {
    it('cycles a column through ascending, descending and unsorted', async () => {
      const user = userEvent.setup();
      await seedAndRender();
      const table = await getTable();
      const header = table.getByRole('columnheader', { name: 'Duration' });

      await user.click(within(header).getByRole('button'));
      expect(header).toHaveAttribute('aria-sort', 'ascending');
      let titles = await getTitles();
      expect(titles[0]).toBe('Respect');
      expect(titles[9]).toBe('Purple Rain');

      await user.click(within(header).getByRole('button'));
      expect(header).toHaveAttribute('aria-sort', 'descending');
      titles = await getTitles();
      expect(titles[0]).toBe('Purple Rain');
      expect(titles[9]).toBe('Respect');

      await user.click(within(header).getByRole('button'));
      expect(header).toHaveAttribute('aria-sort', 'none');
      expect((await getTitles())[0]).toBe('Billie Jean');
    });
  });

  describe('filtering', () => {
    it('searches title and artist case-insensitively', async () => {
      const user = userEvent.setup();
      await seedAndRender();

      await user.type(await screen.findByRole('textbox', { name: 'Search' }), 'QUEEN');

      expect(await getTitles()).toEqual(['Bohemian Rhapsody']);
      expect(screen.getByText('Showing 1 of 10 songs')).toBeInTheDocument();
    });

    it('filters on a substring of the artist', async () => {
      const user = userEvent.setup();
      await seedAndRender();

      await addFilter(user, 'Artist');
      await user.type(screen.getByRole('textbox', { name: 'Artist' }), 'BEATLES');

      expect(await getTitles()).toEqual(['Let It Be']);
    });

    it('filters on a substring of the title', async () => {
      const user = userEvent.setup();
      await seedAndRender();

      await addFilter(user, 'Title');
      await user.type(screen.getByRole('textbox', { name: 'Title' }), 'rain');

      expect(await getTitles()).toEqual(['Purple Rain']);
    });

    it('filters on key', async () => {
      const user = userEvent.setup();
      await seedAndRender();

      await addFilter(user, 'Key');
      await user.selectOptions(screen.getByRole('combobox', { name: 'Key' }), 'C');

      expect(await getTitles()).toEqual(['Let It Be', 'Piano Man', 'Respect']);
    });

    it('filters on the setlist a song is added to', async () => {
      const user = userEvent.setup();
      await seedAndRender();

      await addFilter(user, 'Setlist');
      await user.selectOptions(screen.getByRole('combobox', { name: 'Setlist' }), 'Main Setlist');

      expect(await getTitles()).toEqual([
        'Billie Jean',
        'Bohemian Rhapsody',
        "Don't Stop Believin'",
        'Dreams',
        'September',
        'Superstition',
      ]);
    });

    it('filters on a duration range', async () => {
      const user = userEvent.setup();
      await seedAndRender();

      await addFilter(user, 'Duration');
      expect(screen.getByText('0:00 – 9:00')).toBeInTheDocument();

      // Raise the minimum from 0:00 to 3:00 in steps of 15 seconds
      screen.getByRole('slider', { name: 'Minimum duration' }).focus();
      await user.keyboard('{ArrowRight}'.repeat(12));

      expect(screen.getByText('3:00 – 9:00')).toBeInTheDocument();
      const titles = await getTitles();
      expect(titles).toHaveLength(9);
      expect(titles).not.toContain('Respect');
    });

    it('filters on the absence of content', async () => {
      const user = userEvent.setup();
      await seedAndRender();

      await addFilter(user, 'Has lyrics');
      expect(await getTitles()).toHaveLength(10);

      await user.click(screen.getByRole('radio', { name: 'No' }));

      expect(await getTitles()).toEqual([]);
    });

    it('combines filters with AND', async () => {
      const user = userEvent.setup();
      await seedAndRender();

      await addFilter(user, 'Key');
      await user.selectOptions(screen.getByRole('combobox', { name: 'Key' }), 'C');
      await addFilter(user, 'Artist');
      await user.type(screen.getByRole('textbox', { name: 'Artist' }), 'billy');

      expect(await getTitles()).toEqual(['Piano Man']);
    });

    it('does not offer a filter that was already added', async () => {
      const user = userEvent.setup();
      await seedAndRender();
      await addFilter(user, 'Artist');

      await user.click(screen.getByRole('button', { name: 'Add filter' }));

      expect(await screen.findByRole('menuitem', { name: 'Title' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Artist' })).not.toBeInTheDocument();
    });

    it('stops filtering when a filter is removed', async () => {
      const user = userEvent.setup();
      await seedAndRender();
      await addFilter(user, 'Artist');
      await user.type(screen.getByRole('textbox', { name: 'Artist' }), 'beatles');
      expect(await getTitles()).toHaveLength(1);

      await user.click(screen.getByRole('button', { name: 'Remove Artist filter' }));

      expect(screen.queryByRole('textbox', { name: 'Artist' })).not.toBeInTheDocument();
      expect(await getTitles()).toHaveLength(10);
    });

    it('clears the search and all filters', async () => {
      const user = userEvent.setup();
      await seedAndRender();
      expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
      await user.type(await screen.findByRole('textbox', { name: 'Search' }), 'piano');
      await addFilter(user, 'Key');
      await user.selectOptions(screen.getByRole('combobox', { name: 'Key' }), 'C');
      expect(await getTitles()).toEqual(['Piano Man']);

      await user.click(screen.getByRole('button', { name: 'Clear filters' }));

      expect(screen.queryByRole('combobox', { name: 'Key' })).not.toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('');
      expect(await getTitles()).toHaveLength(10);
    });
  });

  it('deletes a song from the table after confirming', async () => {
    const user = userEvent.setup();
    await seedAndRender();
    const table = await getTable();

    await user.click(
      within(table.getByRole('row', { name: /Billie Jean/ })).getByRole('button', {
        name: 'Delete',
      }),
    );
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Delete' }),
    );

    expect(await getTitles()).toHaveLength(9);
    expect(await getTitles()).not.toContain('Billie Jean');
  });
});
