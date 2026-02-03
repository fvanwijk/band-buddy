import { IconPencil, IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatDate } from '../utils/date';

type SetlistCardProps = {
  date: string;
  id: string;
  isActive?: boolean;
  onActivate: () => void;
  onDelete: () => void;
  setsCount: number;
  songsCount: number;
  title: string;
};

export function SetlistCard({
  date,
  id,
  isActive = false,
  onActivate,
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
            aria-label="Activate"
            color={isActive ? 'primary' : 'default'}
            icon
            onClick={onActivate}
            title={isActive ? 'Active setlist' : 'Activate setlist'}
            variant={isActive ? 'filled' : 'outlined'}
          >
            <IconPlayerPlay className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Edit"
            as={Link}
            color="primary"
            icon
            to={`/setlists/edit/${id}`}
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
