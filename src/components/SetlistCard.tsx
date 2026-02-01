import { Link } from 'react-router-dom';

import { Button } from './Button';
import { Card } from './Card';

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
          <Button as={Link} to={`/setlist/edit/${id}`} variant="default">
            Edit
          </Button>
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        </>
      }
    >
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="flex gap-3 text-sm text-slate-400">
        <span>{new Date(date).toLocaleDateString()}</span>
        <span>
          {setsCount} set{setsCount !== 1 ? 's' : ''}
        </span>
        <span>{songsCount} songs</span>
      </div>
    </Card>
  );
}
