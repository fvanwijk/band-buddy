import { SetCard } from './SetCard';
import type { SetlistSet, Song } from '../types';

type SetlistTableProps = {
  setlistId?: string;
  sets: SetlistSet[];
  songsMap: Map<string, Song>;
};

export function SetlistTable({ setlistId, sets, songsMap }: SetlistTableProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex-1 overflow-y-auto">
        {sets.map((set, setIndex) => (
          <SetCard
            key={set.setNumber}
            set={set}
            setIndex={setIndex}
            setlistId={setlistId}
            sets={sets}
            songsMap={songsMap}
          />
        ))}
      </div>
    </section>
  );
}
