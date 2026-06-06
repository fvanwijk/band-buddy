import { IconTrash } from '@tabler/icons-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Link } from 'react-router-dom';

import type { Instrument, MidiEvent } from '../../../types';
import { Button } from '../../../ui/Button';
import { InputField } from '../../../ui/form/InputField';
import { SelectField } from '../../../ui/form/SelectField';
import { useProgramOptions } from './useProgramOptions';

type FormData = Omit<MidiEvent, 'id'>;

type MidiEventRowProps = {
  canRemove: boolean;
  errors: FieldErrors<FormData>;
  index: number;
  instrumentOptions: Array<{ label: string; value: string }>;
  instruments: Instrument[];
  onRemove: () => void;
  register: UseFormRegister<FormData>;
  selectedInstrumentId?: string;
};

export function MidiEventRow({
  canRemove,
  errors,
  index,
  instrumentOptions,
  instruments,
  onRemove,
  register,
  selectedInstrumentId,
}: MidiEventRowProps) {
  const selectedInstrument = instruments.find((inst) => inst.id === selectedInstrumentId);
  const programOptions = useProgramOptions(selectedInstrument);
  const hasSelectableOptions = programOptions.length > 0;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-700/80 p-2">
      <div className="flex-1">
        <SelectField
          className="h-8 py-1"
          error={errors.events?.[index]?.instrumentId}
          helperText={
            instruments.length === 0 ? (
              <>
                Add the first instrument in{' '}
                <Link className="link" to="/settings/instruments">
                  Settings → Instruments
                </Link>
              </>
            ) : undefined
          }
          hideLabel
          label={`Instrument ${index + 1}`}
          options={instrumentOptions}
          {...register(`events.${index}.instrumentId` as const, {
            required: 'Instrument is required',
          })}
          required
        />
      </div>

      {hasSelectableOptions ? (
        <SelectField
          className="h-8 py-1"
          error={errors.events?.[index]?.programChange}
          hideLabel
          label={`Program ${index + 1}`}
          options={programOptions}
          {...register(`events.${index}.programChange` as const, {
            required: 'Program is required',
            valueAsNumber: true,
          })}
          required
        />
      ) : (
        <InputField
          className="h-8 py-1"
          error={errors.events?.[index]?.programChange}
          hideLabel
          label={`Program Change number ${index + 1}`}
          max="511"
          min="0"
          placeholder="0-511"
          {...register(`events.${index}.programChange` as const, {
            max: { message: 'Program change must be at most 511', value: 511 },
            min: { message: 'Program change must be at least 0', value: 0 },
            required: 'Program change is required',
            valueAsNumber: true,
          })}
          required
          type="number"
        />
      )}

      <div className="shrink-0">
        <Button
          disabled={!canRemove}
          isIcon
          onClick={onRemove}
          title="Remove MIDI event row"
          type="button"
          variant="outlined"
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
