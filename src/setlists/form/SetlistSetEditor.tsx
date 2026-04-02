import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useGetSongs } from '../../api/useSong';
import { Button } from '../../ui/Button';
import { DeleteButton } from '../../ui/DeleteButton';
import { InputField } from '../../ui/form/InputField';
import { SelectField } from '../../ui/form/SelectField';
import type { SetlistFormData } from './SetlistForm';

type SetlistSetEditorProps = {
  index: number;
  onRemove: () => void;
  showRemove: boolean;
};

export function SetlistSetEditor({ index, onRemove, showRemove }: SetlistSetEditorProps) {
  const { getValues, register, setValue, watch } = useFormContext<SetlistFormData>();
  const setName = watch(`sets.${index}.name`);
  const [editing, setEditing] = useState(false);
  const currentSetSongs = watch(`sets.${index}.songs`);
  const allSongs = useGetSongs(true, { sortBy: 'artist' });
  const addableSongs = allSongs.filter((song) => !song.isDeleted);
  const allSetsOfSetlist = watch('sets');

  const songMap = useMemo(() => new Map(allSongs.map((song) => [song.id, song])), [allSongs]);

  const handleAddSong = () => {
    const usedSongIds = new Set(
      allSetsOfSetlist.flatMap((set) => set.songs.map((songRef) => songRef.songId)),
    );

    const songToAdd = addableSongs.find((song) => !usedSongIds.has(song.id)) ?? addableSongs[0];
    if (songToAdd) {
      setValue(`sets.${index}.songs`, [
        ...currentSetSongs,
        {
          setId: '', // This will be set properly in the onSubmit handler of the form
          songId: songToAdd.id,
          songIndex: currentSetSongs.length,
        },
      ]);
    }
  };

  const handleRemoveSong = (songIndex: number) => {
    const updated = currentSetSongs.filter((_, i) => i !== songIndex);
    setValue(`sets.${index}.songs`, updated);
  };

  const handleMoveSong = (songIndex: number, direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (songIndex > 0) {
        // Move up within the same set
        const updated = [...currentSetSongs];
        [updated[songIndex], updated[songIndex - 1]] = [updated[songIndex - 1], updated[songIndex]];
        setValue(`sets.${index}.songs`, updated);
      } else if (index > 0) {
        // Move to the end of the previous set
        const prevSetPath = `sets.${index - 1}.songs` as const;
        const prevSetSongs = getValues(prevSetPath);
        setValue(prevSetPath, [...prevSetSongs, currentSetSongs[songIndex]]);
        handleRemoveSong(songIndex);
      }
    } else {
      if (songIndex < currentSetSongs.length - 1) {
        // Move down within the same set
        const updated = [...currentSetSongs];
        [updated[songIndex], updated[songIndex + 1]] = [updated[songIndex + 1], updated[songIndex]];
        setValue(`sets.${index}.songs`, updated);
      } else if (index < allSetsOfSetlist.length - 1) {
        // Move to the beginning of the next set
        const nextSetPath = `sets.${index + 1}.songs` as const;
        const nextSetSongs = getValues(nextSetPath);

        setValue(nextSetPath, [currentSetSongs[songIndex], ...nextSetSongs]);
        handleRemoveSong(songIndex);
      }
    }
  };

  return (
    <div className="space-y-2 rounded border border-slate-700 bg-slate-900 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {editing ? (
            <InputField
              {...register(`sets.${index}.name`, {
                onBlur: () => setEditing(false),
              })}
              autoFocus
              hideLabel
              label="Set name"
              id={`set-name-${index}`}
              className="ml-0"
              placeholder={`Set ${index + 1} name (optional)`}
              size="small"
              type="text"
            />
          ) : (
            <h4
              className="h-7.5 cursor-pointer font-semibold text-white underline decoration-brand-400 decoration-dashed underline-offset-4"
              tabIndex={0}
              onClick={() => {
                setEditing(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setEditing(true);
                }
              }}
              aria-label={`Edit set name for ${setName?.trim() ? setName : `Set ${index + 1}`}`}
              role="button"
            >
              {setName?.trim() ? setName : `Set ${index + 1}`}
            </h4>
          )}
        </div>
        {showRemove && (
          <Button
            color="danger"
            iconStart={<IconTrash className="h-4 w-4" />}
            onClick={onRemove}
            type="button"
            variant="ghost"
          >
            Remove set
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {currentSetSongs.length === 0 ? (
          <p className="text-sm text-slate-400">No songs in this set</p>
        ) : (
          currentSetSongs.map((songRef, songIndex) => {
            const song = songMap.get(songRef.songId);
            const isHardDeleted = !song;
            const isSoftDeleted = song?.isDeleted;

            return (
              <div key={songIndex} className="flex items-center gap-2">
                <span className="w-6 text-sm font-medium text-slate-500">{songIndex + 1}.</span>

                {isHardDeleted ? (
                  <div className="flex-1">
                    <span className="text-sm text-slate-400 line-through">[Deleted song]</span>
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
                      hideLabel
                      label={`Song ${songIndex + 1} of ${setName?.trim() ? setName : `Set ${index + 1}`}`}
                      options={allSongs.map((s) => ({
                        label: `${s.artist} - ${s.title}`,
                        value: s.id,
                      }))}
                      {...register(`sets.${index}.songs.${songIndex}.songId`)}
                    />
                  </div>
                )}

                <div className="flex gap-1">
                  <Button
                    disabled={songIndex === 0 && index === 0}
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
                      songIndex === currentSetSongs.length - 1 &&
                      index === allSetsOfSetlist.length - 1
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
        Add song to set
      </Button>
    </div>
  );
}
