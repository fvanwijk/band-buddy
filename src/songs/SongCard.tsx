import { SongMetadata } from './SongMetadata';
import { Card } from '../ui/Card';
import { DeleteButton } from '../ui/DeleteButton';
import { EditButton } from '../ui/EditButton';

type SongCardProps = {
  artist: string;
  duration?: number;
  keyNote?: string;
  onDelete: () => void;
  songId: string;
  timeSignature?: string;
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
      <h2 className="truncate text-sm font-semibold text-slate-100">{title}</h2>
      <p className="truncate text-xs text-slate-500">{artist}</p>
      <SongMetadata duration={duration} keyNote={keyNote} timeSignature={timeSignature} />
    </Card>
  );
}
