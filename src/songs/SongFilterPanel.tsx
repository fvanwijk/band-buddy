import { IconX } from '@tabler/icons-react';
import type { FC } from 'react';
import { useController } from 'react-hook-form';
import type { Control, UseFormRegister } from 'react-hook-form';

import { Button } from '../ui/Button';
import { InputField } from '../ui/form/InputField';
import { SelectField } from '../ui/form/SelectField';
import { RangeSlider } from '../ui/RangeSlider';
import { formatDurationToString } from '../utils/duration';
import type { SongFilters } from './filterSongs';

const yesNoOptions = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

const hasFields = [
  { label: 'Has lyrics', name: 'hasLyrics' },
  { label: 'Has sheet music', name: 'hasSheetMusic' },
  { label: 'Has text notes', name: 'hasTextNotes' },
  { label: 'Has MIDI events', name: 'hasMidiEvents' },
] as const;

type SongFilterPanelProps = {
  control: Control<SongFilters>;
  keyOptions: string[];
  // Upper bound of the duration slider in minutes
  maxDurationMinutes: number;
  onClear: () => void;
  onClose: () => void;
  register: UseFormRegister<SongFilters>;
  setlistOptions: Array<{ id: string; name: string }>;
};

export const SongFilterPanel: FC<SongFilterPanelProps> = ({
  control,
  keyOptions,
  maxDurationMinutes,
  onClear,
  onClose,
  register,
  setlistOptions,
}) => {
  const { field: durationMin } = useController({ control, name: 'durationMin' });
  const { field: durationMax } = useController({ control, name: 'durationMax' });

  // An empty string means the thumb is at its boundary, so that bound is not filtered on
  const range: [number, number] = [
    durationMin.value === '' ? 0 : Math.min(Number(durationMin.value), maxDurationMinutes),
    durationMax.value === ''
      ? maxDurationMinutes
      : Math.min(Number(durationMax.value), maxDurationMinutes),
  ];

  const handleRangeChange = ([min, max]: [number, number]) => {
    durationMin.onChange(min <= 0 ? '' : String(min));
    durationMax.onChange(max >= maxDurationMinutes ? '' : String(max));
  };

  return (
    // Full screen overlay below the sm breakpoint, inline panel above it
    <form
      aria-label="Song filters"
      autoComplete="off"
      className="fixed inset-0 z-50 flex flex-col bg-slate-900 sm:static sm:z-auto sm:rounded-lg sm:border sm:border-brand-900 sm:bg-brand-950/40"
      noValidate
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:hidden">
        <h2 className="text-xl font-semibold text-slate-100">Filters</h2>
        <Button
          aria-label="Close filters"
          color="default"
          isIcon
          onClick={onClose}
          type="button"
          variant="text"
        >
          <IconX className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid flex-1 content-start gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        <InputField label="Artist" placeholder="Contains..." type="text" {...register('artist')} />
        <InputField label="Title" placeholder="Contains..." type="text" {...register('title')} />
        <SelectField
          label="Setlist"
          options={[
            { label: 'Any setlist', value: '' },
            ...setlistOptions.map(({ id, name }) => ({ label: name, value: id })),
          ]}
          {...register('setlistId')}
        />
        <SelectField
          label="Key"
          options={[
            { label: 'Any key', value: '' },
            ...keyOptions.map((key) => ({ label: key, value: key })),
          ]}
          {...register('key')}
        />
        <InputField
          label="Transpose"
          placeholder="Semitones"
          step="1"
          type="number"
          {...register('transpose')}
        />
        {hasFields.map(({ label, name }) => (
          <SelectField key={name} label={label} options={yesNoOptions} {...register(name)} />
        ))}
        <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-slate-300">Duration</span>
            <span className="text-sm text-slate-400">
              {formatDurationToString(range[0] * 60)} – {formatDurationToString(range[1] * 60)}
            </span>
          </div>
          <RangeSlider
            max={maxDurationMinutes}
            maxThumbLabel="Maximum duration"
            min={0}
            minThumbLabel="Minimum duration"
            onValueChange={handleRangeChange}
            step={0.5}
            value={range}
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
          <Button
            iconStart={<IconX className="h-4 w-4" />}
            onClick={onClear}
            type="button"
            variant="text"
          >
            Clear filters
          </Button>
        </div>
      </div>
      <div className="border-t border-slate-800 p-4 sm:hidden">
        <Button className="w-full" color="primary" onClick={onClose} type="button" variant="filled">
          Show results
        </Button>
      </div>
    </form>
  );
};
