import type { FC } from 'react';

import { FormattedDuration } from '../active-setlist/FormattedDuration';
import { SongContentIndicators } from '../active-setlist/SongContentIndicators';
import type { Song } from '../types';
import { DeleteButton } from '../ui/DeleteButton';
import { EditButton } from '../ui/EditButton';
import { Table } from '../ui/table/Table';
import { TableCell } from '../ui/table/TableCell';
import { TableHeaderCell } from '../ui/table/TableHeaderCell';
import { TableRow } from '../ui/table/TableRow';
import { formatTranspose } from './SongMetadata';

export type SongSortField = 'artist' | 'duration' | 'key' | 'title';

type SongTableProps = {
  className?: string;
  isActive: (field: SongSortField) => boolean;
  onDelete: (songId: string) => void;
  onSort: (field: SongSortField) => void;
  songs: Song[];
  sortDirection: 'asc' | 'desc' | 'none';
};

export const SongTable: FC<SongTableProps> = ({
  className,
  isActive,
  onDelete,
  onSort,
  songs,
  sortDirection,
}) => {
  const sortableHeader = (field: SongSortField, label: string) => (
    <TableHeaderCell
      onSort={() => onSort(field)}
      sortDirection={isActive(field) ? sortDirection : 'none'}
    >
      {label}
    </TableHeaderCell>
  );

  return (
    <Table
      className={className}
      head={
        <tr>
          {sortableHeader('title', 'Title')}
          {sortableHeader('artist', 'Artist')}
          {sortableHeader('key', 'Key')}
          <TableHeaderCell>Time</TableHeaderCell>
          {sortableHeader('duration', 'Duration')}
          <TableHeaderCell>Content</TableHeaderCell>
          <TableHeaderCell align="right">
            <span className="sr-only">Actions</span>
          </TableHeaderCell>
        </tr>
      }
    >
      {songs.map((song) => (
        <TableRow key={song.id}>
          <TableCell className="font-semibold text-slate-100">{song.title}</TableCell>
          <TableCell>{song.artist}</TableCell>
          <TableCell>
            {song.key}
            {song.transpose ? (
              <span className="ml-0.5 font-medium text-brand-200">
                {formatTranspose(song.transpose)}
              </span>
            ) : null}
          </TableCell>
          <TableCell>{song.timeSignature}</TableCell>
          <TableCell>
            {song.duration !== undefined && <FormattedDuration seconds={song.duration} />}
          </TableCell>
          <TableCell>
            <SongContentIndicators song={song} />
          </TableCell>
          <TableCell align="right">
            <div className="flex justify-end gap-2">
              <EditButton size="small" title="Edit song" to={`/songs/edit/${song.id}`} />
              <DeleteButton onClick={() => onDelete(song.id)} size="small" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};
