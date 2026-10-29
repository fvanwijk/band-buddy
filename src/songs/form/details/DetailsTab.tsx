import type { FC } from 'react';
import {
  useController,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';

import { Card } from '../../../ui/Card';
import { InputField } from '../../../ui/form/InputField';
import { RadioGroup } from '../../../ui/form/RadioGroup';
import type { SongFormData } from '../SongForm';
import { timeSignatureOptions } from '../timeSignatureOptions';
import { KeyPicker } from './key-picker/KeyPicker';

type DetailsTabProps = {
  calculatedMeasures: number | null;
  control: Control<SongFormData>;
  errors: FieldErrors<SongFormData>;
  register: UseFormRegister<SongFormData>;
};

export const DetailsTab: FC<DetailsTabProps> = ({
  calculatedMeasures,
  control,
  errors,
  register,
}) => {
  const { field: keyNote, fieldState: keyNoteState } = useController({
    control,
    name: 'keyNote',
    rules: { required: 'Key is required' },
  });
  const { field: keyQuality } = useController({ control, name: 'keyQuality' });

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
      <KeyPicker
        error={keyNoteState.error}
        label="Key"
        note={keyNote.value}
        onChange={(note, quality) => {
          keyNote.onChange(note);
          keyQuality.onChange(quality);
        }}
        quality={keyQuality.value}
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
};
