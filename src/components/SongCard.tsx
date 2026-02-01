import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { Button } from './Button';
import { Card } from './Card';

type SongCardProps = {
  artist: string;
  keyNote: string;
  onDelete: () => void;
  songId: string;
  timeSignature: string;
  title: string;
};

export function SongCard({
  artist,
  keyNote,
  onDelete,
  songId,
  timeSignature,
  title,
}: SongCardProps) {
  return (
    <Card
      actions={
        <>
          <Button
            as={Link}
            color="primary"
            icon
            to={`/songs/edit/${songId}`}
            title="Edit"
            variant="outlined"
          >
            <IconPencil className="h-4 w-4" />
          </Button>
          <Button color="danger" icon onClick={onDelete} title="Delete" variant="outlined">
            <IconTrash className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <h2 className="text-sm font-semibold text-slate-100 truncate">{title}</h2>
      <p className="text-xs text-slate-500">{artist}</p>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="hidden text-xs text-slate-400 sm:inline">{keyNote}</span>
        <span className="hidden text-xs text-slate-400 sm:inline">{timeSignature}</span>
      </div>
    </Card>
  );
}
