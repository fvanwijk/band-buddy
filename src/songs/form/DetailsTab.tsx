import { useState } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import type { SongFormData } from './SongForm';
import { InputField } from '../../ui/form/InputField';
import { RadioGroup } from '../../ui/form/RadioGroup';
import { Switch } from '../../ui/Switch';

type DetailsTabProps = {
  calculatedMeasures: number | null;
  errors: FieldErrors<SongFormData>;
  existingNote: string;
  register: UseFormRegister<SongFormData>;
};

export function DetailsTab({
  calculatedMeasures,
  errors,
  existingNote,
  register,
}: DetailsTabProps) {
  const [useFlats, setUseFlats] = useState(existingNote.includes('b'));

  const noteOptions = useFlats
    ? [
        { label: 'C', value: 'C' },
        { label: 'D♭', value: 'Db' },
        { label: 'D', value: 'D' },
        { label: 'E♭', value: 'Eb' },
        { label: 'E', value: 'E' },
        { label: 'F', value: 'F' },
        { label: 'G♭', value: 'Gb' },
        { label: 'G', value: 'G' },
        { label: 'A♭', value: 'Ab' },
        { label: 'A', value: 'A' },
        { label: 'B♭', value: 'Bb' },
        { label: 'B', value: 'B' },
      ]
    : [
        { label: 'C', value: 'C' },
        { label: 'C♯', value: 'C#' },
        { label: 'D', value: 'D' },
        { label: 'D♯', value: 'D#' },
        { label: 'E', value: 'E' },
        { label: 'F', value: 'F' },
        { label: 'F♯', value: 'F#' },
        { label: 'G', value: 'G' },
        { label: 'G♯', value: 'G#' },
        { label: 'A', value: 'A' },
        { label: 'A♯', value: 'A#' },
        { label: 'B', value: 'B' },
      ];

  const qualityOptions = [
    { label: 'Major', value: '' },
    { label: 'Minor', value: 'm' },
  ];

  const timeSignatureOptions = [
    { label: '4/4', value: '4/4' },
    { label: '3/4', value: '3/4' },
    { label: '6/8', value: '6/8' },
    { label: '2/4', value: '2/4' },
  ];

  return (
    <div className="space-y-4">
      <InputField
        error={errors.artist}
        label="Artist"
        placeholder="Enter artist name"
        {...register('artist', { required: 'Artist is required' })}
        required
      />
      <InputField
        error={errors.title}
        label="Title"
        placeholder="Enter song title"
        {...register('title', { required: 'Title is required' })}
        required
      />
      <RadioGroup
        error={errors.keyNote}
        label="Key (Note)"
        options={noteOptions}
        register={register('keyNote', { required: 'Key note is required' })}
        required
      >
        <div className="flex items-center gap-2">
          <Switch checked={useFlats} onCheckedChange={setUseFlats} />
          <span className="text-xs font-medium text-slate-400">{useFlats ? '♭' : '♯'}</span>
        </div>
      </RadioGroup>
      <RadioGroup
        error={errors.keyQuality}
        label="Key (Quality)"
        options={qualityOptions}
        register={register('keyQuality', {
          required: 'Key quality is required',
        })}
        required
      />
      <RadioGroup
        error={errors.timeSignature}
        label="Time Signature"
        options={timeSignatureOptions}
        register={register('timeSignature')}
      />
      <InputField
        error={errors.bpm}
        label="BPM"
        max="200"
        min="0"
        placeholder="Enter BPM (0-200)"
        {...register('bpm', {
          max: { message: 'BPM must be at most 200', value: 200 },
          min: { message: 'BPM must be at least 0', value: 0 },
          valueAsNumber: true,
        })}
        type="number"
      />
      <div>
        <InputField
          error={errors.durationString}
          label="Duration (mm:ss)"
          placeholder="Enter duration (mm:ss)"
          {...register('durationString', {
            pattern: {
              message: 'Duration must be in mm:ss format',
              value: /^\d{1,3}:[0-5]\d$/,
            },
          })}
        />
        {!errors.durationString && calculatedMeasures !== null && (
          <p className="mt-1 text-xs text-slate-500">
            ±{calculatedMeasures} measure{calculatedMeasures !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
