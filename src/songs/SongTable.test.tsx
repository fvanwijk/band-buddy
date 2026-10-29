import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { createSong } from '../mocks/songs';
import { MockRouteProvider } from '../testUtils';
import { SongTable } from './SongTable';
import type { SongSortField } from './SongTable';

describe('SongTable', () => {
  const songs = [
    createSong({ artist: 'Queen', duration: 355, id: '1', key: 'Bb', title: 'Bohemian Rhapsody' }),
    createSong({
      artist: 'Stevie Wonder',
      duration: undefined,
      id: '2',
      key: 'Ebm',
      title: 'Superstition',
      transpose: 2,
    }),
  ];

  const renderComponent = (props: Partial<Parameters<typeof SongTable>[0]> = {}) =>
    render(
      <SongTable
        isActive={() => false}
        onDelete={() => {}}
        onSort={() => {}}
        songs={songs}
        sortDirection="none"
        {...props}
      />,
      { wrapper: MockRouteProvider },
    );

  it('renders a row per song', () => {
    renderComponent();

    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByRole('cell', { name: 'Bohemian Rhapsody' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Stevie Wonder' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '5m 55s' })).toBeInTheDocument();
  });

  it('links the title to the edit page', () => {
    renderComponent();

    expect(screen.getByRole('link', { name: 'Bohemian Rhapsody' })).toHaveAttribute(
      'href',
      '/songs/edit/1',
    );
  });

  it('shows the transpose in the key column instead of a separate column', () => {
    renderComponent();

    expect(screen.getByRole('cell', { name: 'Ebm+2' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Bb' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Transpose' })).not.toBeInTheDocument();
  });

  it('shows a non-sortable content column with content indicators', () => {
    renderComponent();

    expect(screen.getByRole('columnheader', { name: 'Content' })).not.toHaveAttribute('aria-sort');
    expect(screen.queryByRole('button', { name: 'Content' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: 'Has lyrics' })).toHaveLength(2);
  });

  it.each([
    ['Title', 'title'],
    ['Artist', 'artist'],
    ['Key', 'key'],
    ['Duration', 'duration'],
  ] as const)('sorts on %s', async (label, field) => {
    const user = userEvent.setup();
    const onSort = vi.fn<(field: SongSortField) => void>();
    renderComponent({ onSort });

    await user.click(screen.getByRole('button', { name: label }));

    expect(onSort).toHaveBeenCalledWith(field);
  });

  it('does not sort on the time column', () => {
    renderComponent();

    expect(
      within(screen.getByRole('columnheader', { name: 'Time' })).queryByRole('button'),
    ).not.toBeInTheDocument();
  });

  it('marks only the active column with the sort direction', () => {
    renderComponent({ isActive: (field) => field === 'key', sortDirection: 'desc' });

    expect(screen.getByRole('columnheader', { name: 'Key' })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    expect(screen.getByRole('columnheader', { name: 'Title' })).toHaveAttribute(
      'aria-sort',
      'none',
    );
  });

  it('links to the edit page of a song', () => {
    renderComponent();

    const row = screen.getByRole('row', { name: /Superstition/ });

    expect(within(row).getByRole('link', { name: 'Edit song' })).toHaveAttribute(
      'href',
      '/songs/edit/2',
    );
  });

  it('calls onDelete with the song id', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderComponent({ onDelete });

    await user.click(
      within(screen.getByRole('row', { name: /Bohemian Rhapsody/ })).getByRole('button', {
        name: 'Delete',
      }),
    );

    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
