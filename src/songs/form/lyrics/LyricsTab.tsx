import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type LyricsTabProps = {
  error?: FieldError;
  register: UseFormRegisterReturn;
};

export function LyricsTab({ error, register }: LyricsTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="lyrics" className="mb-1.5 block text-sm font-medium text-slate-300">
          Chords & lyrics
        </label>
        <textarea
          id="lyrics"
          rows={12}
          {...register}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none"
          placeholder="Enter chords and lyrics..."
        />
        <p className="mt-1 text-xs text-slate-500">
          💡 Chords separated by whitespace will be automatically detected
        </p>
        {error && <p className="mt-1 text-xs text-red-400">{error.message}</p>}
      </div>
    </div>
  );
}
