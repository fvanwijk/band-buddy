import { Link } from 'react-router-dom';

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
          <Link
            to={`/songs/edit/${songId}`}
            className="rounded-md border border-brand-400/20 bg-brand-400/5 p-1.5 text-brand-300 transition-all hover:bg-brand-400/15"
            title="Edit"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Link>
          <button
            onClick={onDelete}
            className="rounded-md border border-red-500/20 bg-red-500/5 p-1.5 text-red-400 transition-all hover:bg-red-500/15"
            title="Delete"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
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
