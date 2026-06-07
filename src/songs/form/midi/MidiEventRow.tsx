import { IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { sendMidiActionToInstrument } from '../../../midi/sendProgramChangeToInstrument';
import { useMidiDevices } from '../../../midi/useMidiDevices';
import type { Instrument } from '../../../types';
import { Button } from '../../../ui/Button';
import { SelectField } from '../../../ui/form/SelectField';
import {
  getInstrumentControlChangeControllerOptions,
  getInstrumentControlChangeDefaultController,
  getInstrumentControlChangeValueOptions,
} from './instrumentMidiLookupTables';
import { MidiEventRowActionDetails } from './MidiEventRowActionDetails';
import { MidiEventRowMessageField } from './MidiEventRowMessageField';
import type { FormData, MidiAction, MidiActionType, RowErrors } from './midiEventRowShared';
import { useProgramOptions } from './useProgramOptions';

type MidiEventRowProps = {
  canRemove: boolean;
  errors: FieldErrors<FormData>;
  index: number;
  instrumentOptions: Array<{ label: string; value: string }>;
  instruments: Instrument[];
  onRemove: () => void;
  register: UseFormRegister<FormData>;
  selectedAction?: MidiAction;
  selectedInstrumentId?: string;
  setValue: UseFormSetValue<FormData>;
};

function getActionType(action: MidiAction | undefined): MidiActionType {
  return action?.type || 'programChange';
}

export function MidiEventRow({
  canRemove,
  errors,
  index,
  instrumentOptions,
  instruments,
  onRemove,
  register,
  selectedAction,
  selectedInstrumentId,
  setValue,
}: MidiEventRowProps) {
  const { isReady, isSupported, outputs } = useMidiDevices();
  const selectedInstrument = instruments.find((inst) => inst.id === selectedInstrumentId);
  const output = selectedInstrument?.midiInId
    ? outputs.find((device) => device.id === selectedInstrument.midiInId)
    : undefined;
  const selectedActionType = getActionType(selectedAction);
  const rowErrors = errors.events?.[index] as RowErrors;

  const programOptions = useProgramOptions(selectedInstrument);
  const hasSelectableOptions = programOptions.length > 0;
  const controlChangeControllerOptions =
    getInstrumentControlChangeControllerOptions(selectedInstrument);
  const selectedControlChangeController =
    selectedAction?.type === 'controlChange' ? selectedAction.controller : 0;
  const controlChangeValueOptions = getInstrumentControlChangeValueOptions(
    selectedInstrument,
    selectedControlChangeController,
  );

  const handleTestEvent = () => {
    if (!output || !selectedInstrument || !isReady || !isSupported || !selectedAction) {
      return;
    }

    sendMidiActionToInstrument(selectedAction, selectedInstrument, outputs);
  };

  const handleTypeChange = (type: MidiActionType) => {
    const basePath = `events.${index}` as const;

    setValue(`${basePath}.instrumentId`, selectedInstrumentId || instruments[0]?.id || '');
    setValue(`${basePath}.type`, type);

    if (type === 'programChange') {
      setValue(`${basePath}.programChange`, 0);
      return;
    }

    if (type === 'controlChange') {
      setValue(
        `${basePath}.controller`,
        getInstrumentControlChangeDefaultController(selectedInstrument),
      );
      setValue(`${basePath}.value`, 0);
      return;
    }

    setValue(`${basePath}.parameterLsb`, 0);
    setValue(`${basePath}.parameterMsb`, 0);
    setValue(`${basePath}.valueLsb`, undefined);
    setValue(`${basePath}.valueMsb`, 0);
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-700/80 p-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <SelectField
            error={rowErrors?.instrumentId}
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
            label={`Instrument ${index + 1}`}
            options={instrumentOptions}
            {...register(`events.${index}.instrumentId` as const, {
              required: 'Instrument is required',
            })}
            required
          />
        </div>

        <div className="min-w-0">
          <SelectField
            error={rowErrors?.type}
            label={`Message type ${index + 1}`}
            onChange={(event) => handleTypeChange(event.target.value as MidiActionType)}
            options={[
              { label: 'Program Change', value: 'programChange' },
              { label: 'Control Change', value: 'controlChange' },
              { label: 'NRPN', value: 'nrpn' },
            ]}
            value={selectedActionType}
          />
        </div>

        <div className="min-w-0">
          <MidiEventRowMessageField
            controlChangeControllerOptions={controlChangeControllerOptions}
            hasSelectableOptions={hasSelectableOptions}
            index={index}
            programOptions={programOptions}
            register={register}
            rowErrors={rowErrors}
            selectedAction={selectedAction}
            selectedActionType={selectedActionType}
            setValue={setValue}
          />
        </div>
      </div>

      <MidiEventRowActionDetails
        controlChangeValueOptions={controlChangeValueOptions}
        index={index}
        register={register}
        rowErrors={rowErrors}
        selectedAction={selectedAction}
        selectedActionType={selectedActionType}
        setValue={setValue}
      />

      <div className="flex items-end justify-end gap-2">
        <Button
          disabled={!isReady || !isSupported || !output || !selectedAction}
          isIcon
          onClick={handleTestEvent}
          title="Test MIDI event row"
          type="button"
          variant="outlined"
        >
          <IconPlayerPlay className="h-4 w-4" />
        </Button>

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
