import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { BackButton } from './BackButton';
import { Button } from './Button';
import { FormField } from './FormField';
import { SetlistSetEditor } from './SetlistSetEditor';
import type { Setlist, SetlistSet } from '../types/setlist';

type FormData = Omit<Setlist, 'id' | 'sets'> & {
  sets: SetlistSet[];
};

type SetlistFormProps = {
  backPath?: string;
  initialData?: Setlist;
  onSubmit: (data: FormData) => void;
  title: string;
};

export function SetlistForm({
  backPath = '/setlist',
  initialData,
  onSubmit,
  title,
}: SetlistFormProps) {
  const navigate = useNavigate();
  const methods = useForm<FormData>({
    defaultValues: {
      date: initialData?.date || new Date().toISOString().split('T')[0],
      sets: initialData?.sets || [{ setNumber: 1, songs: [] }],
      title: initialData?.title || '',
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
      <section className="flex h-full flex-col gap-6">
        <header>
          <div className="mb-6 flex items-center gap-3">
            <BackButton onClick={() => navigate(backPath)} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">
                Library
              </p>
              <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
            <FormField
              error={errors.title}
              id="title"
              label="Setlist Title"
              placeholder="Enter setlist title"
              register={register('title', { required: 'Setlist title is required' })}
              required
            />

            <FormField
              error={errors.date}
              id="date"
              label="Performance Date"
              register={register('date', { required: 'Date is required' })}
              required
              type="date"
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-100">Sets</h3>
                {fields.length < 3 && (
                  <Button
                    className="text-xs"
                    onClick={handleAddSet}
                    type="button"
                    variant="primary"
                  >
                    Add Set
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
              <Button
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
                onClick={() => navigate(backPath)}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-lg border border-brand-400/30 bg-brand-400/10 px-4 py-2 text-sm font-medium text-brand-200 hover:bg-brand-400/20"
                type="submit"
                variant="ghost"
              >
                {initialData ? 'Save Changes' : 'Create Setlist'}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </FormProvider>
  );
}
