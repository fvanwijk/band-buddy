import { useMemo } from 'react';

import { useSongs } from '../store/useStore';
import type { Song, SongReference } from '../types/setlist';

type SetlistSetEditorProps = {
  onRemove: (setNumber: number) => void;
  onSongsChange: (setNumber: number, songs: SongReference[]) => void;
  set: { setNumber: number; songs: SongReference[] };
  showRemove: boolean;
};

export function SetlistSetEditor({
  onRemove,
  onSongsChange,
  set,
  showRemove,
}: SetlistSetEditorProps) {
  const allSongs = useSongs();

  const songMap = useMemo(() => {
    const map: Record<string, Song> = {};
    allSongs.forEach((song) => {
      map[song.id] = song;
    });
    return map;
  }, [allSongs]);

  const handleAddSong = () => {
    const availableSongs = allSongs.filter((song) => !set.songs.some((s) => s.songId === song.id));

    if (availableSongs.length > 0) {
      onSongsChange(set.setNumber, [...set.songs, { songId: availableSongs[0].id }]);
    }
  };

  const handleRemoveSong = (index: number) => {
    const updated = set.songs.filter((_, i) => i !== index);
    onSongsChange(set.setNumber, updated);
  };

  const handleMoveSong = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < set.songs.length) {
      const updated = [...set.songs];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      onSongsChange(set.setNumber, updated);
    }
  };

  const handleSongChange = (index: number, newSongId: string) => {
    const updated = [...set.songs];
    updated[index] = { songId: newSongId };
    onSongsChange(set.setNumber, updated);
  };

  return (
    <div className="space-y-2 rounded border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900 dark:text-white">Set {set.setNumber}</h4>
        {showRemove && (
          <button
            className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
            onClick={() => onRemove(set.setNumber)}
            type="button"
          >
            Remove Set
          </button>
        )}
      </div>

      <div className="space-y-2">
        {set.songs.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No songs in this set</p>
        ) : (
          set.songs.map((songRef, index) => {
            const song = songMap[songRef.songId];
            const isDeleted = songRef.isDeleted || !song;

            return (
              <div
                key={index}
                className={`flex items-center gap-2 rounded border p-2 ${
                  isDeleted
                    ? 'border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950'
                }`}
              >
                <span className="w-6 text-sm font-medium text-slate-500">{index + 1}.</span>

                {isDeleted ? (
                  <div className="flex-1">
                    <span className="text-sm text-slate-500 line-through dark:text-slate-400">
                      [Deleted Song]
                    </span>
                  </div>
                ) : (
                  <select
                    className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    onChange={(e) => handleSongChange(index, e.target.value)}
                    value={songRef.songId}
                  >
                    {allSongs.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.artist} - {s.title}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex gap-1">
                  <button
                    aria-label="Move up"
                    className="rounded bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
                    disabled={index === 0 || isDeleted}
                    onClick={() => handleMoveSong(index, 'up')}
                    type="button"
                  >
                    ↑
                  </button>
                  <button
                    aria-label="Move down"
                    className="rounded bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
                    disabled={index === set.songs.length - 1 || isDeleted}
                    onClick={() => handleMoveSong(index, 'down')}
                    type="button"
                  >
                    ↓
                  </button>
                  <button
                    aria-label="Remove song"
                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                    onClick={() => handleRemoveSong(index)}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        className="w-full rounded border border-dashed border-brand-300 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-600 hover:border-brand-400 hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-950 dark:text-brand-400 dark:hover:bg-brand-900"
        onClick={handleAddSong}
        type="button"
      >
        + Add Song to Set
      </button>
    </div>
  );
}
