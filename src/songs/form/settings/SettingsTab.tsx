import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { InputField } from '../../../ui/form/InputField';
import { SelectField } from '../../../ui/form/SelectField';
import type { SongFormData } from '../SongForm';

type SettingsTabProps = {
  errors: FieldErrors<SongFormData>;
  register: UseFormRegister<SongFormData>;
};

export const defaultTabOptions = [
  { label: 'Lyrics', value: 'lyrics' },
  { label: 'Sheet music', value: 'sheet-music' },
  { label: 'Notes', value: 'notes' },
  { label: 'MIDI buttons', value: 'midi' },
];

export function SettingsTab({ errors, register }: SettingsTabProps) {
  return (
    <div className="space-y-4">
      <SelectField
        helperText="When you open a song during a performance, it will automatically show the tab you select here. You can change the default tab for each song, so feel free to choose the one that best suits the content of your song.For example, if your song has PDF sheet music, setting the default tab to 'Sheet music' can be helpful for quick access during performances."
        label="Default tab"
        options={defaultTabOptions}
        {...register('defaultTab')}
      />
      <InputField
        error={errors.transpose}
        helperText="Applied during performance playback."
        label="Transpose (semitones)"
        max="24"
        min="-24"
        placeholder="0"
        step="1"
        type="number"
        {...register('transpose', {
          max: { message: 'Transpose must be at most 24', value: 24 },
          min: { message: 'Transpose must be at least -24', value: -24 },
          setValueAs: (value) => (value === '' ? undefined : Number(value)),
          validate: (value) =>
            value === undefined || Number.isInteger(value) || 'Transpose must be a whole number',
        })}
      />
    </div>
  );
}
