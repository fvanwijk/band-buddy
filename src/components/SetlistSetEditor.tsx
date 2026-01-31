import { useMemo } from 'react';

import { Button } from './Button';
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
          <Button onClick={() => onRemove(set.setNumber)} type="button" variant="danger">
            Remove Set
          </Button>
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
                  <Button
                    aria-label="Move up"
                    disabled={index === 0 || isDeleted}
                    onClick={() => handleMoveSong(index, 'up')}
                    type="button"
                    variant="default"
                  >
                    ↑
                  </Button>
                  <Button
                    aria-label="Move down"
                    disabled={index === set.songs.length - 1 || isDeleted}
                    onClick={() => handleMoveSong(index, 'down')}
                    type="button"
                    variant="default"
                  >
                    ↓
                  </Button>
                  <Button
                    aria-label="Remove song"
                    onClick={() => handleRemoveSong(index)}
                    type="button"
                    variant="danger"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Button className="w-full" onClick={handleAddSong} type="button" variant="outline">
        + Add Song to Set
      </Button>
    </div>
  );
}
