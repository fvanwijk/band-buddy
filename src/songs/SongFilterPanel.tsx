import { IconSearch, IconX } from '@tabler/icons-react';
import type { FC, ReactNode } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { Button } from '../ui/Button';
import { InputField } from '../ui/form/InputField';
import { RadioGroup } from '../ui/form/RadioGroup';
import { SelectField } from '../ui/form/SelectField';
import { RangeSlider } from '../ui/RangeSlider';
import { formatDurationToString } from '../utils/duration';
import type { SongFilters } from './filterSongs';
import { SongFilterActions } from './SongFilterActions';
import { filterDefinitions } from './songFilterDefinitions';
import type { FilterDefinition, FilterId } from './songFilterDefinitions';

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

type SongFilterPanelProps = {
  activeIds: FilterId[];
  keyOptions: string[];
  // Upper bound of the duration slider in minutes
  maxDurationMinutes: number;
  onAdd: (id: FilterId) => void;
  onClear: () => void;
  onRemove: (definition: FilterDefinition) => void;
  setlistOptions: Array<{ id: string; name: string }>;
};

export const SongFilterPanel: FC<SongFilterPanelProps> = ({
  activeIds,
  keyOptions,
  maxDurationMinutes,
  onAdd,
  onClear,
  onRemove,
  setlistOptions,
}) => {
  const { control, register } = useFormContext<SongFilters>();
  const search = useWatch({ control, name: 'search' });
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

  const renderControl = (id: FilterId): ReactNode => {
    switch (id) {
      case 'hasLyrics':
      case 'hasMidiEvents':
      case 'hasSheetMusic':
      case 'hasTextNotes':
        return (
          <RadioGroup
            inline
            label={filterDefinitions.find((definition) => definition.id === id)!.label}
            options={yesNoOptions}
            register={register(id)}
          />
        );
      case 'artist':
        return (
          <InputField
            inline
            label="Artist"
            placeholder="Contains..."
            size="xsmall"
            type="text"
            {...register('artist')}
          />
        );
      case 'durationRange':
        return (
          <div className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm font-medium text-slate-300">Duration</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <RangeSlider
                max={maxDurationMinutes}
                maxThumbLabel="Maximum duration"
                min={0}
                minThumbLabel="Minimum duration"
                onValueChange={handleRangeChange}
                step={0.5}
                value={range}
              />
              <span className="text-xs text-slate-400">
                {formatDurationToString(range[0] * 60)} – {formatDurationToString(range[1] * 60)}
              </span>
            </div>
          </div>
        );
      case 'key':
        return (
          <SelectField
            inline
            label="Key"
            options={[
              { label: 'Any key', value: '' },
              ...keyOptions.map((key) => ({ label: key, value: key })),
            ]}
            size="xsmall"
            {...register('key')}
          />
        );
      case 'setlistId':
        return (
          <SelectField
            inline
            label="Setlist"
            options={[
              { label: 'Any setlist', value: '' },
              ...setlistOptions.map(({ id, name }) => ({ label: name, value: id })),
            ]}
            size="xsmall"
            {...register('setlistId')}
          />
        );
      case 'title':
        return (
          <InputField
            inline
            label="Title"
            placeholder="Contains..."
            size="xsmall"
            type="text"
            {...register('title')}
          />
        );
      case 'transpose':
        return (
          <InputField
            inline
            label="Transpose"
            placeholder="Semitones"
            size="xsmall"
            step="1"
            type="number"
            {...register('transpose')}
          />
        );
    }
  };

  const activeDefinitions = filterDefinitions.filter(({ id }) => activeIds.includes(id));

  return (
    <form
      aria-label="Song filters"
      autoComplete="off"
      className="flex flex-col gap-1.5"
      noValidate
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex items-start gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <InputField
            className="pl-10"
            hideLabel
            label="Search"
            placeholder="Search by title or artist..."
            size="small"
            type="text"
            {...register('search')}
          />
        </div>
        <SongFilterActions
          canClear={activeIds.length > 0 || search !== ''}
          activeIds={activeIds}
          onAdd={onAdd}
          onClear={onClear}
        />
      </div>
      {activeDefinitions.map((definition) => (
        <div key={definition.id} className="flex max-w-md items-center gap-1">
          <div className="min-w-0 flex-1">{renderControl(definition.id)}</div>
          <Button
            aria-label={`Remove ${definition.label} filter`}
            className="p-1!"
            isIcon
            onClick={() => onRemove(definition)}
            type="button"
            variant="text"
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </form>
  );
};
