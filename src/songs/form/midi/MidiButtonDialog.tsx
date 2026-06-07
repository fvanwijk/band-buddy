import { IconPlus } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import type { Instrument, MidiEvent, MidiEventAction } from '../../../types';
import { Button } from '../../../ui/Button';
import { Dialog } from '../../../ui/Dialog';
import { InputField } from '../../../ui/form/InputField';
import { MidiEventRow } from './MidiEventRow';

type FormData = Omit<MidiEvent, 'id'>;

function getDefaultMidiEvent(instrumentId: string): MidiEvent['events'][number] {
  return {
    instrumentId,
    programChange: 0,
    type: 'programChange',
  };
}

function normalizeMidiAction(action: MidiEventAction): MidiEventAction {
  if (action.type === 'controlChange') {
    return {
      controller: action.controller,
      instrumentId: action.instrumentId,
      type: 'controlChange',
      value: action.value,
    };
  }

  if (action.type === 'nrpn') {
    return {
      instrumentId: action.instrumentId,
      parameterLsb: action.parameterLsb,
      parameterMsb: action.parameterMsb,
      type: 'nrpn',
      valueLsb: action.valueLsb,
      valueMsb: action.valueMsb,
    };
  }

  const normalizedProgramChange: Extract<MidiEventAction, { type?: 'programChange' }> = {
    instrumentId: action.instrumentId,
    programChange: action.programChange,
  };

  if (action.type) {
    normalizedProgramChange.type = action.type;
  }

  return normalizedProgramChange;
}

type MidiButtonDialogProps = {
  initialData?: FormData;
  instruments: Instrument[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<MidiEvent, 'id'>) => void;
};

export function MidiButtonDialog({
  initialData,
  instruments,
  isOpen,
  onClose,
  onSubmit,
}: MidiButtonDialogProps) {
  const isEditMode = !!initialData;

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      events: initialData?.events || [getDefaultMidiEvent(instruments[0]?.id || '')],
      label: initialData?.label || '',
    },
    mode: 'all',
  });

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'events',
  });

  const selectedEvents =
    useWatch({
      control,
      defaultValue: initialData?.events || [getDefaultMidiEvent(instruments[0]?.id || '')],
      name: 'events',
    }) || [];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      events: initialData?.events || [getDefaultMidiEvent(instruments[0]?.id || '')],
      label: initialData?.label || '',
    });
  }, [initialData, instruments, isOpen, reset]);

  const handleAdd = (data: FormData) => {
    onSubmit({
      ...data,
      events: data.events.map((action) => normalizeMidiAction(action)),
    });
    onClose();
  };

  const handleFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.stopPropagation(); // Prevent outer form from also submitting
    void handleSubmit(handleAdd)(e);
  };

  const instrumentOptions = instruments.map((inst) => ({
    label: inst.name,
    value: inst.id,
  }));

  return (
    <Dialog
      contentClassName="max-w-5xl"
      onClose={onClose}
      open={isOpen}
      title={isEditMode ? 'Edit MIDI Button' : 'Add MIDI Button'}
    >
      <form autoComplete="off" noValidate onSubmit={handleFormSubmit}>
        <div className="space-y-4">
          <InputField
            error={errors.label}
            label="Button label"
            placeholder="e.g., Verse, Chorus, Bridge"
            {...register('label', { required: 'Label is required' })}
            required
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">MIDI Events</h3>
              <Button
                isIcon
                onClick={() =>
                  append({
                    instrumentId: instruments[0]?.id || '',
                    programChange: 0,
                    type: 'programChange',
                  })
                }
                title="Add MIDI event row"
                type="button"
                variant="outlined"
              >
                <IconPlus className="h-4 w-4" />
              </Button>
            </div>

            {fields.map((field, index) => (
              <MidiEventRow
                canRemove={fields.length > 1}
                errors={errors}
                index={index}
                instrumentOptions={instrumentOptions}
                instruments={instruments}
                key={field.id}
                onRemove={() => remove(index)}
                register={register}
                selectedAction={selectedEvents[index]}
                selectedInstrumentId={selectedEvents[index]?.instrumentId}
                setValue={setValue}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button className="flex-1" onClick={onClose} type="button" variant="outlined">
            Cancel
          </Button>
          <Button
            color="primary"
            className="flex-1"
            iconStart={!isEditMode ? <IconPlus className="h-4 w-4" /> : undefined}
            type="submit"
            variant="filled"
          >
            {isEditMode ? 'Update button' : 'Add button'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
