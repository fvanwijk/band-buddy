import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';

import { SelectField } from '../../../ui/form/SelectField';
import type { MidiSelectOption } from './instrumentMidiLookupTables';
import type { FormData, MidiAction, MidiActionType, RowErrors } from './midiEventRowShared';
import { MidiNumberField } from './MidiNumberField';

type MidiEventRowActionDetailsProps = {
  controlChangeValueOptions: MidiSelectOption[] | undefined;
  index: number;
  register: UseFormRegister<FormData>;
  rowErrors: RowErrors;
  selectedAction: MidiAction | undefined;
  selectedActionType: MidiActionType;
  setValue: UseFormSetValue<FormData>;
};

export function MidiEventRowActionDetails({
  controlChangeValueOptions,
  index,
  register,
  rowErrors,
  selectedAction,
  selectedActionType,
  setValue,
}: MidiEventRowActionDetailsProps) {
  if (selectedActionType === 'controlChange') {
    return (
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="min-w-0">
          {controlChangeValueOptions ? (
            <SelectField
              error={rowErrors?.value}
              label={`CC Value ${index + 1}`}
              onChange={(event) => {
                const basePath = `events.${index}` as const;
                setValue(`${basePath}.value`, Number(event.target.value));
              }}
              options={controlChangeValueOptions}
              value={String(selectedAction?.type === 'controlChange' ? selectedAction.value : 0)}
            />
          ) : (
            <MidiNumberField
              error={rowErrors?.value}
              label={`CC Value ${index + 1}`}
              max={127}
              min={0}
              placeholder="Value"
              registration={register(`events.${index}.value` as const, {
                max: { message: 'Value must be at most 127', value: 127 },
                min: { message: 'Value must be at least 0', value: 0 },
                required: 'Value is required',
                valueAsNumber: true,
              })}
              required
            />
          )}
        </div>
      </div>
    );
  }

  if (selectedActionType === 'nrpn') {
    return (
      <div className="grid gap-3 lg:grid-cols-4">
        <div className="min-w-0">
          <MidiNumberField
            error={rowErrors?.parameterLsb}
            label={`NRPN parameter LSB ${index + 1}`}
            max={127}
            min={0}
            placeholder="Param LSB"
            registration={register(`events.${index}.parameterLsb` as const, {
              max: { message: 'Parameter LSB must be at most 127', value: 127 },
              min: { message: 'Parameter LSB must be at least 0', value: 0 },
              required: 'Parameter LSB is required',
              valueAsNumber: true,
            })}
            required
          />
        </div>
        <div className="min-w-0">
          <MidiNumberField
            error={rowErrors?.valueMsb}
            label={`NRPN value MSB ${index + 1}`}
            max={127}
            min={0}
            placeholder="Value MSB"
            registration={register(`events.${index}.valueMsb` as const, {
              max: { message: 'Value MSB must be at most 127', value: 127 },
              min: { message: 'Value MSB must be at least 0', value: 0 },
              required: 'Value MSB is required',
              valueAsNumber: true,
            })}
            required
          />
        </div>
        <div className="min-w-0">
          <MidiNumberField
            error={rowErrors?.valueLsb}
            label={`NRPN value LSB ${index + 1}`}
            max={127}
            min={0}
            placeholder="Value LSB (optional)"
            registration={register(`events.${index}.valueLsb` as const, {
              max: { message: 'Value LSB must be at most 127', value: 127 },
              min: { message: 'Value LSB must be at least 0', value: 0 },
              setValueAs: (value: string) => (value === '' ? undefined : Number(value)),
            })}
          />
        </div>
      </div>
    );
  }

  return null;
}
