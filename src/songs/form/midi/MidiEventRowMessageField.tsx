import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';

import { SelectField } from '../../../ui/form/SelectField';
import type { MidiSelectOption, MidiSelectOptions } from './instrumentMidiLookupTables';
import type { FormData, MidiAction, MidiActionType, RowErrors } from './midiEventRowShared';
import { MidiNumberField } from './MidiNumberField';

type MidiEventRowMessageFieldProps = {
  controlChangeControllerOptions: MidiSelectOption[] | undefined;
  hasSelectableOptions: boolean;
  index: number;
  programOptions: MidiSelectOptions;
  register: UseFormRegister<FormData>;
  rowErrors: RowErrors;
  selectedAction: MidiAction | undefined;
  selectedActionType: MidiActionType;
  setValue: UseFormSetValue<FormData>;
};

export function MidiEventRowMessageField({
  controlChangeControllerOptions,
  hasSelectableOptions,
  index,
  programOptions,
  register,
  rowErrors,
  selectedAction,
  selectedActionType,
  setValue,
}: MidiEventRowMessageFieldProps) {
  if (selectedActionType === 'programChange') {
    if (hasSelectableOptions) {
      return (
        <SelectField
          error={rowErrors?.programChange}
          label={`Program ${index + 1}`}
          options={programOptions}
          {...register(`events.${index}.programChange` as const, {
            required: 'Program is required',
            valueAsNumber: true,
          })}
          required
        />
      );
    }

    return (
      <MidiNumberField
        error={rowErrors?.programChange}
        label={`Program Change number ${index + 1}`}
        max={511}
        min={0}
        placeholder="0-511"
        registration={register(`events.${index}.programChange` as const, {
          max: { message: 'Program change must be at most 511', value: 511 },
          min: { message: 'Program change must be at least 0', value: 0 },
          required: 'Program change is required',
          valueAsNumber: true,
        })}
        required
      />
    );
  }

  if (selectedActionType === 'controlChange') {
    if (controlChangeControllerOptions) {
      return (
        <SelectField
          error={rowErrors?.controller}
          label={`Controller ${index + 1}`}
          onChange={(event) => {
            const basePath = `events.${index}` as const;
            setValue(`${basePath}.controller`, Number(event.target.value));
          }}
          options={controlChangeControllerOptions}
          value={String(selectedAction?.type === 'controlChange' ? selectedAction.controller : 0)}
        />
      );
    }

    return (
      <MidiNumberField
        error={rowErrors?.controller}
        label="Controller #"
        max={127}
        min={0}
        placeholder="CC#"
        registration={register(`events.${index}.controller` as const, {
          max: { message: 'Controller must be at most 127', value: 127 },
          min: { message: 'Controller must be at least 0', value: 0 },
          required: 'Controller is required',
          valueAsNumber: true,
        })}
        required
      />
    );
  }

  return (
    <MidiNumberField
      error={rowErrors?.parameterMsb}
      label={`NRPN parameter MSB ${index + 1}`}
      max={127}
      min={0}
      placeholder="Param MSB"
      registration={register(`events.${index}.parameterMsb` as const, {
        max: { message: 'Parameter MSB must be at most 127', value: 127 },
        min: { message: 'Parameter MSB must be at least 0', value: 0 },
        required: 'Parameter MSB is required',
        valueAsNumber: true,
      })}
      required
    />
  );
}
