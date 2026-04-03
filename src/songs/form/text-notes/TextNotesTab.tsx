import type { UseFormRegisterReturn } from 'react-hook-form';

type TextNotesTabProps = {
  register: UseFormRegisterReturn;
};

export function TextNotesTab({ register }: TextNotesTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-slate-300">
          Notes
        </label>
        <textarea
          id="notes"
          rows={12}
          {...register}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none"
          placeholder="Add notes, chord changes, or reminders..."
        />
      </div>
    </div>
  );
}
