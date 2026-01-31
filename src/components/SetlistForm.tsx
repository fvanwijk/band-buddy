import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { SetlistSetEditor } from './SetlistSetEditor';
import type { Setlist, SetlistSet, SongReference } from '../types/setlist';

type FormData = Omit<Setlist, 'id' | 'sets'> & {
  sets: SetlistSet[];
};

type SetlistFormProps = {
  initialData?: Setlist;
  onSubmit: (data: FormData) => void;
  title: string;
};

export function SetlistForm({ initialData, onSubmit, title }: SetlistFormProps) {
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
    <form
      className="space-y-6 rounded-lg border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-slate-950"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Setlist Title <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
          id="title"
          placeholder="Enter setlist title"
          {...register('title', { required: 'Setlist title is required' })}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Performance Date <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          id="date"
          type="date"
          {...register('date', { required: 'Date is required' })}
        />
        {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sets</h3>
          {sets.length < 3 && (
            <button
              className="rounded bg-brand-500 px-3 py-1 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              onClick={handleAddSet}
              type="button"
            >
              Add Set
            </button>
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
        <button
          className="flex-1 rounded bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          type="submit"
        >
          Save Setlist
        </button>
      </div>
    </form>
  );
}
