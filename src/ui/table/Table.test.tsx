import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { Table } from './Table';
import { TableCell } from './TableCell';
import { TableHeaderCell } from './TableHeaderCell';
import { TableRow } from './TableRow';

describe('Table', () => {
  const renderComponent = ({
    onSort = () => {},
    sortDirection,
  }: {
    onSort?: () => void;
    sortDirection?: 'asc' | 'desc' | 'none';
  } = {}) =>
    render(
      <Table
        head={
          <tr>
            <TableHeaderCell onSort={onSort} sortDirection={sortDirection}>
              Title
            </TableHeaderCell>
            <TableHeaderCell>Plain</TableHeaderCell>
          </tr>
        }
      >
        <TableRow>
          <TableCell>Bohemian Rhapsody</TableCell>
          <TableCell align="right">Queen</TableCell>
        </TableRow>
      </Table>,
    );

  it('renders head and body rows', () => {
    renderComponent();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByRole('cell', { name: 'Bohemian Rhapsody' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Queen' })).toHaveClass('text-right');
  });

  it('calls onSort when a sortable header is clicked', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    renderComponent({ onSort });

    await user.click(screen.getByRole('button', { name: 'Title' }));

    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['asc', 'ascending'],
    ['desc', 'descending'],
    ['none', 'none'],
  ] as const)('sets aria-sort for sort direction %s', (sortDirection, expected) => {
    renderComponent({ sortDirection });

    expect(screen.getByRole('columnheader', { name: 'Title' })).toHaveAttribute(
      'aria-sort',
      expected,
    );
  });

  it('does not make a header without onSort sortable', () => {
    renderComponent();

    const header = screen.getByRole('columnheader', { name: 'Plain' });

    expect(within(header).queryByRole('button')).not.toBeInTheDocument();
    expect(header).not.toHaveAttribute('aria-sort');
  });
});
