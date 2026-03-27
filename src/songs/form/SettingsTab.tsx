import type { UseFormRegister } from 'react-hook-form';

import { SelectField } from '../../ui/form/SelectField';
import type { SongFormData } from './SongForm';

type SettingsTabProps = {
  register: UseFormRegister<SongFormData>;
};

export const defaultTabOptions = [
  { label: 'Lyrics', value: 'lyrics' },
  { label: 'Sheet music', value: 'sheet-music' },
  { label: 'Notes', value: 'notes' },
  { label: 'MIDI buttons', value: 'midi' },
];

export function SettingsTab({ register }: SettingsTabProps) {
  return (
    <div className="space-y-4">
      <p className="mb-3 text-xs text-slate-500">
        When you open a song during a performance, it will automatically show the tab you select
        here. You can change the default tab for each song, so feel free to choose the one that best
        suits the content of your song.
        <br />
        For example, if your song has PDF sheet music, setting the default tab to "Sheet music" can
        be helpful for quick access during performances.
      </p>
      <SelectField label="Default tab" options={defaultTabOptions} {...register('defaultTab')} />
    </div>
  );
}
