import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import type { SetlistSetWithSongs } from '../types';
import { SetCard } from './SetCard';

type SetlistTableProps = {
  setlistId?: string;
  sets: SetlistSetWithSongs[];
};

export function SetlistTable({ setlistId, sets }: SetlistTableProps) {
  let runningIndex = 0;
  const songStartIndexes = sets.map((set) => {
    const currentIndex = runningIndex;
    runningIndex += set.songs.length;
    return currentIndex;
  });

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex-1 overflow-y-auto">
        {sets.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">
            This setlist has no sets.{' '}
            <Link className="link" to={`/setlists/edit/${setlistId}`}>
              Edit the setlist
            </Link>{' '}
            to add some sets.
          </p>
        )}
        {sets.map((set, setIndex) => (
          <Fragment key={set.id}>
            <SetCard
              set={set}
              setIndex={setIndex}
              setlistId={setlistId}
              songStartIndex={songStartIndexes[setIndex]}
            />
            {setIndex < sets.length - 1 && (
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="h-px flex-1 bg-slate-700" />
                <span className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                  Break
                </span>
                <div className="h-px flex-1 bg-slate-700" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
