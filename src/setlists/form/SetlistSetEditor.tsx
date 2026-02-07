import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import type { SetlistFormData } from './SetlistForm';
import { useGetSongs } from '../../api/useSong';
import { Button } from '../../ui/Button';
import { DeleteButton } from '../../ui/DeleteButton';
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
  const { getValues, register, setValue, watch } = useFormContext<SetlistFormData>();
  const songs = watch(`sets.${index}.songs`);
  const allSongs = useGetSongs(true);
  const addableSongs = allSongs.filter((song) => !song.isDeleted);
  const allSets = watch('sets');

  const songMap = useMemo(() => new Map(allSongs.map((song) => [song.id, song])), [allSongs]);

  const handleAddSong = () => {
    const usedSongIds = new Set(
      allSets.flatMap((set) => set.songs.map((songRef) => songRef.songId)),
    );

    const songToAdd = addableSongs.find((song) => !usedSongIds.has(song.id)) ?? addableSongs[0];
    if (songToAdd) {
      setValue(`sets.${index}.songs`, [...songs, { songId: songToAdd.id }]);
    }
  };

  const handleRemoveSong = (songIndex: number) => {
    const updated = songs.filter((_, i) => i !== songIndex);
    setValue(`sets.${index}.songs`, updated);
  };

  const handleMoveSong = (songIndex: number, direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (songIndex > 0) {
        // Move up within the same set
        const updated = [...songs];
        [updated[songIndex], updated[songIndex - 1]] = [updated[songIndex - 1], updated[songIndex]];
        setValue(`sets.${index}.songs`, updated);
      } else if (index > 0) {
        // Move to the end of the previous set
        const prevSetPath = `sets.${index - 1}.songs` as const;
        const prevSetSongs = getValues(prevSetPath);
        setValue(prevSetPath, [...prevSetSongs, songs[songIndex]]);
        handleRemoveSong(songIndex);
      }
    } else {
      if (songIndex < songs.length - 1) {
        // Move down within the same set
        const updated = [...songs];
        [updated[songIndex], updated[songIndex + 1]] = [updated[songIndex + 1], updated[songIndex]];
        setValue(`sets.${index}.songs`, updated);
      } else if (index < allSets.length - 1) {
        // Move to the beginning of the next set
        const nextSetPath = `sets.${index + 1}.songs` as const;
        const nextSetSongs = getValues(nextSetPath);
        setValue(nextSetPath, [songs[songIndex], ...nextSetSongs]);
        handleRemoveSong(songIndex);
      }
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
            const song = songMap.get(songRef.songId);
            const isHardDeleted = !song;
            const isSoftDeleted = song?.isDeleted;
            const isDeleted = isHardDeleted || isSoftDeleted;

            return (
              <div key={songIndex} className="flex items-center gap-2">
                <span className="w-6 text-sm font-medium text-slate-500">{songIndex + 1}.</span>

                {isHardDeleted ? (
                  <div className="flex-1">
                    <span className="text-sm text-slate-400 line-through">[Deleted Song]</span>
                  </div>
                ) : isSoftDeleted ? (
                  <div className="flex-1">
                    <span className="text-sm text-slate-400 line-through">
                      {song.artist} - {song.title}
                      <span className="ml-2 text-xs text-slate-500">(Deleted)</span>
                    </span>
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
                    disabled={(songIndex === 0 && index === 0) || isDeleted}
                    icon
                    onClick={() => handleMoveSong(songIndex, 'up')}
                    title="Move up"
                    type="button"
                    variant="ghost"
                  >
                    <IconArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={
                      (songIndex === songs.length - 1 && index === allSets.length - 1) || isDeleted
                    }
                    icon
                    onClick={() => handleMoveSong(songIndex, 'down')}
                    title="Move down"
                    type="button"
                    variant="ghost"
                  >
                    <IconArrowDown className="h-4 w-4" />
                  </Button>
                  <DeleteButton onClick={() => handleRemoveSong(songIndex)} title="Delete song" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <Button
        className="w-full border-dashed"
        color="primary"
        disabled={!addableSongs.length}
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
