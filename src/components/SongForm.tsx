import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FormField } from './FormField';
import { RadioGroup } from './RadioGroup';
import type { Song } from '../types/setlist';

type SongFormData = Omit<Song, 'id'> & {
  keyNote?: string;
  keyQuality?: string;
};

type SongFormProps = {
  initialData?: Song;
  onSubmit: (data: {
    artist: string;
    title: string;
    key: string;
    timeSignature: string;
    bpm?: number;
  }) => void;
  title: string;
};

export function SongForm({ initialData, onSubmit, title }: SongFormProps) {
  const navigate = useNavigate();
  const [useFlats, setUseFlats] = useState(false);

  const existingKey = initialData?.key || 'C';
  const existingNote = existingKey.replace(/m$/, '');
  const existingQuality = existingKey.endsWith('m') ? 'm' : '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SongFormData>({
    defaultValues: {
      artist: initialData?.artist || '',
      title: initialData?.title || '',
      keyNote: existingNote,
      keyQuality: existingQuality,
      timeSignature: initialData?.timeSignature || '4/4',
      bpm: initialData?.bpm || undefined,
    },
  });

  useEffect(() => {
    // Auto-detect if the existing key uses flats
    if (existingNote.includes('b')) {
      setUseFlats(true);
    }
  }, [existingNote]);

  const noteOptions = useFlats
    ? [
        { value: 'C', label: 'C' },
        { value: 'Db', label: 'D♭' },
        { value: 'D', label: 'D' },
        { value: 'Eb', label: 'E♭' },
        { value: 'E', label: 'E' },
        { value: 'F', label: 'F' },
        { value: 'Gb', label: 'G♭' },
        { value: 'G', label: 'G' },
        { value: 'Ab', label: 'A♭' },
        { value: 'A', label: 'A' },
        { value: 'Bb', label: 'B♭' },
        { value: 'B', label: 'B' },
      ]
    : [
        { value: 'C', label: 'C' },
        { value: 'C#', label: 'C♯' },
        { value: 'D', label: 'D' },
        { value: 'D#', label: 'D♯' },
        { value: 'E', label: 'E' },
        { value: 'F', label: 'F' },
        { value: 'F#', label: 'F♯' },
        { value: 'G', label: 'G' },
        { value: 'G#', label: 'G♯' },
        { value: 'A', label: 'A' },
        { value: 'A#', label: 'A♯' },
        { value: 'B', label: 'B' },
      ];

  const qualityOptions = [
    { value: '', label: 'Major' },
    { value: 'm', label: 'Minor' },
  ];

  const timeSignatureOptions = [
    { value: '4/4', label: '4/4' },
    { value: '3/4', label: '3/4' },
    { value: '6/8', label: '6/8' },
    { value: '2/4', label: '2/4' },
  ];

  const handleFormSubmit = (data: SongFormData) => {
    // Combine note and quality for the key
    const key = (data.keyNote || existingNote) + (data.keyQuality || '');
    const finalData: {
      artist: string;
      title: string;
      key: string;
      timeSignature: string;
      bpm?: number;
    } = {
      artist: data.artist,
      title: data.title,
      key,
      timeSignature: data.timeSignature,
    };
    if (data.bpm) {
      finalData.bpm = data.bpm;
    }
    onSubmit(finalData);
  };

  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate('/songs')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">
              Library
            </p>
            <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
          autoComplete="off"
          noValidate
        >
          <FormField
            label="Artist"
            id="artist"
            placeholder="Enter artist name"
            error={errors.artist}
            register={register('artist', { required: 'Artist is required' })}
            required
          />

          <FormField
            label="Title"
            id="title"
            placeholder="Enter song title"
            error={errors.title}
            register={register('title', { required: 'Title is required' })}
            required
          />

          {/* Key Note Selection */}
          <RadioGroup
            label="Key (Note)"
            options={noteOptions}
            error={errors.keyNote}
            register={register('keyNote', { required: 'Key note is required' })}
            required
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUseFlats(!useFlats)}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                  useFlats ? 'bg-brand-400/30' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-100 transition-transform ${
                    useFlats ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-slate-400">{useFlats ? '♭' : '♯'}</span>
            </div>
          </RadioGroup>

          {/* Key Quality Selection */}
          <RadioGroup
            label="Key (Quality)"
            options={qualityOptions}
            error={errors.keyQuality}
            register={register('keyQuality')}
          />

          {/* Time Signature */}
          <RadioGroup
            label="Time Signature"
            options={timeSignatureOptions}
            error={errors.timeSignature}
            register={register('timeSignature', {
              required: 'Time signature is required',
            })}
          />

          {/* BPM */}
          <div>
            <label htmlFor="bpm" className="mb-1.5 block text-sm font-medium text-slate-300">
              BPM (optional)
            </label>
            <input
              id="bpm"
              type="number"
              min="0"
              max="200"
              {...register('bpm', {
                valueAsNumber: true,
                min: { value: 0, message: 'BPM must be at least 0' },
                max: { value: 200, message: 'BPM must be at most 200' },
              })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
              placeholder="Enter BPM (0-200)"
            />
            {errors.bpm && <p className="mt-1 text-xs text-red-400">{errors.bpm.message}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/songs')}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg border border-brand-400/30 bg-brand-400/10 px-4 py-2 text-sm font-medium text-brand-200 hover:bg-brand-400/20"
            >
              {initialData ? 'Save Changes' : 'Add Song'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
