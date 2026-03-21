import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { useGetSongs } from '../../api/useSong';
import type { SetlistSetTable, SetlistSongTable, SetlistTable, SetlistWithSets } from '../../types';
import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import { InputField } from '../../ui/form/InputField';
import { Page } from '../../ui/Page';
import { PageHeader } from '../../ui/PageHeader';
import { SetlistSetEditor } from './SetlistSetEditor';

export type SetlistFormData = SetlistTable & {
  sets: (SetlistSetTable & { songs: SetlistSongTable[] })[];
};

export type SetlistFormProps = {
  backPath: string;
  initialData?: SetlistWithSets;
  onSubmit: (data: SetlistFormData) => void;
  title: string;
};

export function SetlistForm({ backPath, initialData, onSubmit, title }: SetlistFormProps) {
  const songs = useGetSongs();
  const methods = useForm<SetlistFormData>({
    defaultValues: initialData ?? {
      date: new Date().toISOString().split('T')[0],
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

    append({
      name: '',
      setIndex: newSetIndex,
      setlistId: initialData?.id || '',
      songs: [],
    });
  };

  const handleRemoveSet = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleFormSubmit = (data: SetlistFormData) => {
    onSubmit(data);
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
              label="Setlist title"
              placeholder="Enter setlist title"
              {...register('title', { required: 'Setlist title is required' })}
              required
            />

            <InputField
              error={errors.date}
              label="Performance date"
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
                {initialData ? 'Save changes' : 'Create setlist'}
              </Button>
            </div>
          </form>
        </div>
      </Page>
    </FormProvider>
  );
}
