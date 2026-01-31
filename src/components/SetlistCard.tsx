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
          <button
            className="rounded bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="rounded bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600"
            onClick={onDelete}
          >
            Delete
          </button>
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
