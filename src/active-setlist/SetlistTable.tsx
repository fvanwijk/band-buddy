import { Link } from 'react-router-dom';

import { SetCard } from './SetCard';
import type { SetlistSetWithSongs } from '../types';

type SetlistTableProps = {
  setlistId?: string;
  sets: SetlistSetWithSongs[];
};

export function SetlistTable({ setlistId, sets }: SetlistTableProps) {
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
          <SetCard key={set.id} set={set} setIndex={setIndex} setlistId={setlistId} sets={sets} />
        ))}
      </div>
    </section>
  );
}
