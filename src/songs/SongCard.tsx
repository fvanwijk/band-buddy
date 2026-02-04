import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { FormattedDuration } from '../active-setlist/FormattedDuration';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type SongCardProps = {
  artist: string;
  duration?: number;
  keyNote: string;
  onDelete: () => void;
  songId: string;
  timeSignature: string;
  title: string;
};

export function SongCard({
  artist,
  duration,
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
      <div className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
        <span className="hidden sm:inline">{keyNote}</span>•
        <span className="hidden sm:inline">{timeSignature}</span>
        {duration && (
          <>
            •
            <span>
              <FormattedDuration seconds={duration} />
            </span>
          </>
        )}
      </div>
    </Card>
  );
}
