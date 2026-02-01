import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { BackButton } from './BackButton';
import { Button } from './Button';
import { SetlistSetEditor } from './SetlistSetEditor';
import type { Setlist, SetlistSet, SongReference } from '../types/setlist';

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
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      date: initialData?.date || new Date().toISOString().split('T')[0],
      sets: initialData?.sets || [{ setNumber: 1, songs: [] }],
      title: initialData?.title || '',
    },
  });

  const [sets, setSets] = useState<SetlistSet[]>(
    initialData?.sets || [{ setNumber: 1, songs: [] }],
  );

  useEffect(() => {
    setValue('sets', sets);
  }, [sets, setValue]);

  const handleAddSet = () => {
    const newSetNumber = Math.max(...sets.map((s) => s.setNumber), 0) + 1;
    if (newSetNumber <= 3) {
      setSets([...sets, { setNumber: newSetNumber, songs: [] }]);
    }
  };

  const handleRemoveSet = (setNumber: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((s) => s.setNumber !== setNumber));
    }
  };

  const handleSetSongs = (setNumber: number, songs: SongReference[]) => {
    setSets(sets.map((s) => (s.setNumber === setNumber ? { ...s, songs } : s)));
  };

  const handleFormSubmit = (data: FormData) => {
    // Ensure sets are in order
    const orderedSets = sets.sort((a, b) => a.setNumber - b.setNumber);
    onSubmit({
      ...data,
      sets: orderedSets,
    });
  };

  return (
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
          <div className="space-y-1">
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="title">
              Setlist Title <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
              id="title"
              placeholder="Enter setlist title"
              {...register('title', { required: 'Setlist title is required' })}
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="date">
              Performance Date <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
              id="date"
              type="date"
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date.message}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100">Sets</h3>
              {sets.length < 3 && (
                <Button className="text-xs" onClick={handleAddSet} type="button" variant="primary">
                  Add Set
                </Button>
              )}
            </div>

            {sets.map((setList) => (
              <SetlistSetEditor
                key={setList.setNumber}
                onRemove={handleRemoveSet}
                onSongsChange={handleSetSongs}
                set={setList}
                showRemove={sets.length > 1}
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
  );
}
