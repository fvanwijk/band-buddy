import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { Button } from './Button';
import { Card } from './Card';
import { formatDate } from '../utils/date';

type SetlistCardProps = {
  date: string;
  id: string;
  onDelete: () => void;
  setsCount: number;
  songsCount: number;
  title: string;
};

export function SetlistCard({
  date,
  id,
  onDelete,
  setsCount,
  songsCount,
  title,
}: SetlistCardProps) {
  return (
    <Card
      actions={
        <>
          <Button
            aria-label="Edit"
            as={Link}
            color="primary"
            icon
            to={`/setlist/edit/${id}`}
            variant="outlined"
          >
            <IconPencil className="h-4 w-4" />
          </Button>
          <Button aria-label="Delete" color="danger" onClick={onDelete} icon variant="outlined">
            <IconTrash className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="flex gap-3 text-sm text-slate-400">
        <span>{formatDate(date)}</span>
        <span>
          {setsCount} set{setsCount !== 1 ? 's' : ''}
        </span>
        <span>{songsCount} songs</span>
      </div>
    </Card>
  );
}
