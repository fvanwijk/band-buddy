import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from './Button';
import { SelectField } from './SelectField';
import { useSongs } from '../store/useStore';
import type { Song, SongReference } from '../types/setlist';

type SetlistSetEditorProps = {
  index: number;
  onRemove: () => void;
  setNumber: number;
  showRemove: boolean;
};

export function SetlistSetEditor({
  index,
  onRemove,
  setNumber,
  showRemove,
}: SetlistSetEditorProps) {
  const { register, setValue, watch } = useFormContext();
  const songs = watch(`sets.${index}.songs`) as SongReference[];
  const allSongs = useSongs();

  const songMap = useMemo(() => {
    const map: Record<string, Song> = {};
    allSongs.forEach((song) => {
      map[song.id] = song;
    });
    return map;
  }, [allSongs]);

  const handleAddSong = () => {
    const availableSongs = allSongs.filter((song) => !songs.some((s) => s.songId === song.id));

    if (availableSongs.length > 0) {
      setValue(`sets.${index}.songs`, [...songs, { songId: availableSongs[0].id }]);
    }
  };

  const handleRemoveSong = (songIndex: number) => {
    const updated = songs.filter((_, i) => i !== songIndex);
    setValue(`sets.${index}.songs`, updated);
  };

  const handleMoveSong = (songIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? songIndex - 1 : songIndex + 1;
    if (newIndex >= 0 && newIndex < songs.length) {
      const updated = [...songs];
      [updated[songIndex], updated[newIndex]] = [updated[newIndex], updated[songIndex]];
      setValue(`sets.${index}.songs`, updated);
    }
  };

  return (
    <div className="space-y-2 rounded border border-slate-700 bg-slate-900 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-white">Set {setNumber}</h4>
        {showRemove && (
          <Button onClick={onRemove} type="button" variant="danger">
            Remove Set
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {songs.length === 0 ? (
          <p className="text-sm text-slate-400">No songs in this set</p>
        ) : (
          songs.map((songRef, songIndex) => {
            const song = songMap[songRef.songId];
            const isDeleted = songRef.isDeleted || !song;

            return (
              <div
                key={songIndex}
                className={`flex items-center gap-2 rounded border p-2 ${
                  isDeleted ? 'border-slate-600 bg-slate-800' : 'border-slate-700 bg-slate-950'
                }`}
              >
                <span className="w-6 text-sm font-medium text-slate-500">{songIndex + 1}.</span>

                {isDeleted ? (
                  <div className="flex-1">
                    <span className="text-sm text-slate-400 line-through">[Deleted Song]</span>
                  </div>
                ) : (
                  <div className="flex-1">
                    <SelectField
                      options={allSongs.map((s) => ({
                        label: `${s.artist} - ${s.title}`,
                        value: s.id,
                      }))}
                      register={register(`sets.${index}.songs.${songIndex}.songId`)}
                    />
                  </div>
                )}

                <div className="flex gap-1">
                  <Button
                    aria-label="Move up"
                    disabled={songIndex === 0 || isDeleted}
                    onClick={() => handleMoveSong(songIndex, 'up')}
                    type="button"
                    variant="default"
                  >
                    ↑
                  </Button>
                  <Button
                    aria-label="Move down"
                    disabled={songIndex === songs.length - 1 || isDeleted}
                    onClick={() => handleMoveSong(songIndex, 'down')}
                    type="button"
                    variant="default"
                  >
                    ↓
                  </Button>
                  <Button
                    aria-label="Remove song"
                    onClick={() => handleRemoveSong(songIndex)}
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
