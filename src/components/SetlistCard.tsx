import { Button } from './Button';
import { Card } from './Card';

type SetlistCardProps = {
  date: string;
  onDelete: () => void;
  onEdit: () => void;
  setsCount: number;
  songsCount: number;
  title: string;
};

export function SetlistCard({
  date,
  onDelete,
  onEdit,
  setsCount,
  songsCount,
  title,
}: SetlistCardProps) {
  return (
    <Card
      actions={
        <>
          <Button variant="default" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        </>
      }
    >
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="flex gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>{new Date(date).toLocaleDateString()}</span>
        <span>
          {setsCount} set{setsCount !== 1 ? 's' : ''}
        </span>
        <span>{songsCount} songs</span>
      </div>
    </Card>
  );
}
