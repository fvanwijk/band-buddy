import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { SetlistSetEditor } from './SetlistSetEditor';
import type { Setlist, SetlistSet } from '../../types';
import { Button } from '../../ui/Button';
import { InputField } from '../../ui/form/InputField';
import { Page } from '../../ui/Page';
import { PageHeader } from '../../ui/PageHeader';

type FormData = Omit<Setlist, 'id' | 'sets'> & {
  sets: SetlistSet[];
};

type SetlistFormProps = {
  backPath: string;
  initialData?: Setlist;
  onSubmit: (data: FormData) => void;
  title: string;
};

export function SetlistForm({ backPath, initialData, onSubmit, title }: SetlistFormProps) {
  const methods = useForm<FormData>({
    defaultValues: {
      date: initialData?.date || new Date().toISOString().split('T')[0],
      sets: initialData?.sets || [{ setNumber: 1, songs: [] }],
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
    const newSetNumber = Math.max(...fields.map((s) => s.setNumber), 0) + 1;
    if (newSetNumber <= 3) {
      append({ setNumber: newSetNumber, songs: [] });
    }
  };

  const handleRemoveSet = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleFormSubmit = (data: FormData) => {
    // Ensure sets are in order
    const orderedSets = [...data.sets].sort((a, b) => a.setNumber - b.setNumber);
    onSubmit({
      ...data,
      sets: orderedSets,
    });
  };

  return (
    <FormProvider {...methods}>
      <Page>
        <PageHeader backPath={backPath} title={title} />

        <div>
          <form
            autoComplete="off"
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4"
            noValidate
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <InputField
              error={errors.title}
              id="title"
              label="Setlist Title"
              placeholder="Enter setlist title"
              register={register('title', { required: 'Setlist title is required' })}
              required
            />

            <InputField
              error={errors.date}
              id="date"
              label="Performance Date"
              register={register('date', { required: 'Date is required' })}
              required
              type="date"
            />

            <InputField
              error={errors.venue}
              id="venue"
              label="Venue"
              placeholder="Enter venue"
              register={register('venue')}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-100">Sets</h3>
                {fields.length < 3 && (
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
                )}
              </div>

              {fields.map((field, index) => (
                <SetlistSetEditor
                  key={field.id}
                  index={index}
                  onRemove={() => handleRemoveSet(index)}
                  setNumber={field.setNumber}
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
