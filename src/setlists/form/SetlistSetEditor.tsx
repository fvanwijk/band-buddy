import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import type { SetlistFormData } from './SetlistForm';
import { useGetSongs } from '../../api/useSong';
import type { Song } from '../../types';
import { Button } from '../../ui/Button';
import { SelectField } from '../../ui/form/SelectField';

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
  const { register, setValue, watch } = useFormContext<SetlistFormData>();
  const songs = watch(`sets.${index}.songs`);
  const allSongs = useGetSongs();
  const allSets = watch('sets');

  const songMap = useMemo(() => {
    const map: Record<string, Song> = {};
    allSongs.forEach((song) => {
      map[song.id] = song;
    });
    return map;
  }, [allSongs]);

  const handleAddSong = () => {
    const usedSongIds = new Set<string>();
    allSets.forEach((set) => {
      set.songs.forEach((songRef) => {
        usedSongIds.add(songRef.songId);
      });
    });

    const availableSongs = allSongs.find((song) => !usedSongIds.has(song.id));
    const songToAdd = availableSongs || (allSongs.length > 0 ? allSongs[0] : null);

    if (songToAdd) {
      setValue(`sets.${index}.songs`, [...songs, { songId: songToAdd.id }]);
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
          <Button
            color="danger"
            iconStart={<IconTrash className="h-4 w-4" />}
            onClick={onRemove}
            type="button"
            variant="ghost"
          >
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
              <div key={songIndex} className="flex items-center gap-2">
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
                    icon
                    onClick={() => handleMoveSong(songIndex, 'up')}
                    type="button"
                    variant="ghost"
                  >
                    <IconArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label="Move down"
                    disabled={songIndex === songs.length - 1 || isDeleted}
                    icon
                    onClick={() => handleMoveSong(songIndex, 'down')}
                    type="button"
                    variant="ghost"
                  >
                    <IconArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label="Remove song"
                    color="danger"
                    icon
                    onClick={() => handleRemoveSong(songIndex)}
                    type="button"
                    variant="outlined"
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Button
        className="w-full border-dashed"
        color="primary"
        iconStart={<IconPlus className="h-4 w-4" />}
        onClick={handleAddSong}
        type="button"
        variant="outlined"
      >
        Add Song to Set
      </Button>
    </div>
  );
}
