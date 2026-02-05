import { FormattedDuration } from '../active-setlist/FormattedDuration';
import { Card } from '../ui/Card';
import { DeleteButton } from '../ui/DeleteButton';
import { EditButton } from '../ui/EditButton';

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
          <EditButton title="Edit song" to={`/songs/edit/${songId}`} />
          <DeleteButton onClick={onDelete} />
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
