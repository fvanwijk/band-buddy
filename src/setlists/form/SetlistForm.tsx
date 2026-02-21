import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useStore } from 'tinybase/ui-react';

import { SetlistSetEditor } from './SetlistSetEditor';
import { useGetSongs } from '../../api/useSong';
import type { Setlist, SetlistSet } from '../../types';
import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import { InputField } from '../../ui/form/InputField';
import { Page } from '../../ui/Page';
import { PageHeader } from '../../ui/PageHeader';

export type SetlistFormData = Omit<Setlist, 'id' | 'sets'> & {
  sets: SetlistSet[];
};

type SetlistFormProps = {
  backPath: string;
  initialData?: Setlist;
  onSubmit: (data: SetlistFormData) => void;
  title: string;
};

export function SetlistForm({ backPath, initialData, onSubmit, title }: SetlistFormProps) {
  const songs = useGetSongs();
  const methods = useForm<SetlistFormData>({
    defaultValues: {
      date: initialData?.date || new Date().toISOString().split('T')[0],
      sets: initialData?.sets?.map((set, idx) => ({
        id: set.id || nanoid(),
        name: typeof set.name === 'string' ? set.name : '',
        setIndex: typeof set.setIndex === 'number' ? set.setIndex : idx,
        setlistId: set.setlistId || initialData?.id || '',
        songs:
          set.songs?.map((song, songIndex) => ({
            setId: set.id || nanoid(),
            songId: song.songId,
            songIndex: typeof song.songIndex === 'number' ? song.songIndex : songIndex,
            isDeleted: song.isDeleted,
          })) || [],
      })) || [
        {
          id: nanoid(),
          name: '',
          setIndex: 0,
          setlistId: initialData?.id || '',
          songs: [],
        },
      ],
      title: initialData?.title || '',
      venue: initialData?.venue || '',
    },
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = methods;

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'sets',
  });

  const handleAddSet = () => {
    const newSetIndex =
      Math.max(...fields.map((s) => (typeof s.setIndex === 'number' ? s.setIndex : 0)), 0) + 1;
    const setlistId = initialData?.id || nanoid();
    append({
      id: nanoid(),
      name: '',
      setIndex: newSetIndex,
      setlistId,
      songs: [],
    });
  };

  const handleRemoveSet = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const store = useStore();

  const handleFormSubmit = (data: SetlistFormData) => {
    // Generate set IDs and store sets in Tinybase
    const setlistId = initialData?.id || nanoid();
    const setsWithIds = data.sets.map((set, idx) => {
      const setId = set.id || nanoid();
      const setName = typeof set.name === 'string' ? set.name : '';
      const setIndex = typeof set.setIndex === 'number' ? set.setIndex : idx;
      if (store) {
        store.setRow('setlistSets', setId, {
          id: setId,
          name: setName,
          setIndex,
          setlistId,
        });
      }
      return {
        id: setId,
        name: setName,
        setIndex,
        setlistId,
        songs: (set.songs || [])
          .filter((song) => typeof song.songId === 'string')
          .map((song, songIndex) => ({
            setId,
            songId: song.songId,
            songIndex: typeof song.songIndex === 'number' ? song.songIndex : songIndex,
            isDeleted: song.isDeleted,
          })),
      };
    });

    onSubmit({
      date: data.date,
      sets: setsWithIds,
      title: data.title,
      venue: data.venue,
    });
  };

  return (
    <FormProvider {...methods}>
      <Page>
        <PageHeader backPath={backPath} title={title} />

        <div>
          <form
            autoComplete="off"
            className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            noValidate
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <InputField
              error={errors.title}
              label="Setlist Title"
              placeholder="Enter setlist title"
              {...register('title', { required: 'Setlist title is required' })}
              required
            />

            <InputField
              error={errors.date}
              label="Performance Date"
              {...register('date', { required: 'Date is required' })}
              required
              type="date"
            />

            <InputField
              error={errors.venue}
              label="Venue"
              placeholder="Enter venue"
              {...register('venue')}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-100">Sets</h3>

                <Button
                  className="text-xs"
                  color="primary"
                  iconStart={<IconPlus className="h-4 w-4" />}
                  onClick={handleAddSet}
                  type="button"
                  variant="ghost"
                >
                  Add set
                </Button>
              </div>

              {songs.length === 0 && (
                <Alert severity="info">
                  You don't have songs in your library.{' '}
                  <Link className="link" to="/songs/add">
                    Add some songs
                  </Link>{' '}
                  to be added to a set.
                </Alert>
              )}

              {fields.map((field, index) => (
                <SetlistSetEditor
                  key={field.id}
                  index={index}
                  onRemove={() => handleRemoveSet(index)}
                  showRemove={fields.length > 1}
                />
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button as={Link} className="flex-1" to={backPath} type="button" variant="outlined">
                Cancel
              </Button>
              <Button
                className="flex-1"
                color="primary"
                iconStart={<IconDeviceFloppy className="h-4 w-4" />}
                type="submit"
                variant="filled"
              >
                {initialData ? 'Save Changes' : 'Create Setlist'}
              </Button>
            </div>
          </form>
        </div>
      </Page>
    </FormProvider>
  );
}
