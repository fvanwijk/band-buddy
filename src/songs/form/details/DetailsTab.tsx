import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { Card } from '../../../ui/Card';
import { InputField } from '../../../ui/form/InputField';
import { RadioGroup } from '../../../ui/form/RadioGroup';
import type { SongFormData } from '../SongForm';
import { timeSignatureOptions } from '../timeSignatureOptions';

type DetailsTabProps = {
  calculatedMeasures: number | null;
  errors: FieldErrors<SongFormData>;
  register: UseFormRegister<SongFormData>;
};

export function DetailsTab({ calculatedMeasures, errors, register }: DetailsTabProps) {
  const natural = 'row-span-2 self-center';
  const noteOptions = [
    { className: natural, label: 'C', value: 'C' },
    { label: 'C♯', value: 'C#' },
    { label: 'D♭', value: 'Db' },
    { className: natural, label: 'D', value: 'D' },
    { label: 'D♯', value: 'D#' },
    { label: 'E♭', value: 'Eb' },
    { className: natural, label: 'E', value: 'E' },
    { className: natural, label: 'F', value: 'F' },
    { label: 'F♯', value: 'F#' },
    { label: 'G♭', value: 'Gb' },
    { className: natural, label: 'G', value: 'G' },
    { label: 'G♯', value: 'G#' },
    { label: 'A♭', value: 'Ab' },
    { className: natural, label: 'A', value: 'A' },
    { label: 'A♯', value: 'A#' },
    { label: 'B♭', value: 'Bb' },
    { className: natural, label: 'B', value: 'B' },
  ];

  const qualityOptions = [
    { label: 'Major', value: '' },
    { label: 'Minor', value: 'm' },
  ];

  const languageOptions = [
    { label: '🇺🇸 English', value: 'en' },
    { label: '🇳🇱 Dutch', value: 'nl' },
  ];

  return (
    <Card>
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
        label="Key (note)"
        listClassName="grid grid-flow-col grid-rows-2 gap-1.5 overflow-x-auto"
        options={noteOptions}
        register={register('keyNote', { required: 'Key note is required' })}
        required
      />
      <RadioGroup
        error={errors.keyQuality}
        label="Key (quality)"
        options={qualityOptions}
        register={register('keyQuality', {
          required: 'Key quality is required',
        })}
        required
      />
      <RadioGroup
        error={errors.timeSignature}
        label="Time signature"
        options={timeSignatureOptions}
        register={register('timeSignature')}
      />

      <div className="flex flex-col gap-6 sm:flex-row">
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
        <fieldset>
          <legend className="sr-only mb-1.5 text-sm font-medium text-slate-300">Duration</legend>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <InputField
                error={errors.durationMinutes}
                label="Minutes"
                min="0"
                placeholder="m"
                type="number"
                {...register('durationMinutes', {
                  max: { message: 'Minutes must be at most 999', value: 999 },
                  min: { message: 'Minutes must be at least 0', value: 0 },
                  valueAsNumber: true,
                })}
              />
            </div>
            <span className="mt-5 shrink-0 text-slate-400">:</span>
            <div className="min-w-0 flex-1">
              <InputField
                error={errors.durationSeconds}
                label="Seconds"
                max="59"
                min="0"
                placeholder="ss"
                type="number"
                {...register('durationSeconds', {
                  max: { message: 'Seconds must be at most 59', value: 59 },
                  min: { message: 'Seconds must be at least 0', value: 0 },
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>
        </fieldset>
      </div>
      {!errors.durationMinutes && !errors.durationSeconds && calculatedMeasures !== null && (
        <p className="text-xs text-slate-500">
          ±{calculatedMeasures} measure{calculatedMeasures !== 1 ? 's' : ''}
        </p>
      )}
      <div>
        <RadioGroup label="Language" options={languageOptions} register={register('language')} />
        <p className="mt-1 text-xs text-slate-500">
          Used to announce the song title before the pre count. English when not set.
        </p>
      </div>
    </Card>
  );
}
