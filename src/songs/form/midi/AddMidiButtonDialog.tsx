import { IconPlus } from '@tabler/icons-react';
import { createPortal } from 'react-dom';
import { useForm, useWatch } from 'react-hook-form';

import { useProgramOptions } from './useProgramOptions';
import type { Instrument, MidiEvent } from '../../../types';
import { Button } from '../../../ui/Button';
import { InputField } from '../../../ui/form/InputField';
import { SelectField } from '../../../ui/form/SelectField';

type FormData = Omit<MidiEvent, 'id'>;

type AddMidiButtonDialogProps = {
  instruments: Instrument[];
  isOpen: boolean;
  onAdd: (event: Omit<MidiEvent, 'id'>) => void;
  onClose: () => void;
};

export function AddMidiButtonDialog({
  instruments,
  isOpen,
  onAdd,
  onClose,
}: AddMidiButtonDialogProps) {
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      instrumentId: instruments[0]?.id || '',
      label: '',
      programChange: 0,
    },
  });

  const selectedInstrumentId = useWatch({ control, name: 'instrumentId' });

  const selectedInstrument = instruments.find((inst) => inst.id === selectedInstrumentId);
  const programOptions = useProgramOptions(selectedInstrument);
  const hasSelectableOptions = programOptions.length > 0;

  if (!isOpen) return null;

  const handleAdd = (data: FormData) => {
    onAdd(data);
    reset();
    onClose();
  };

  const handleFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.stopPropagation(); // Prevent outer form from submitting
    handleSubmit(handleAdd)(e);
  };

  const instrumentOptions = instruments.map((inst) => ({
    label: inst.name,
    value: inst.id,
  }));

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-slate-100">Add MIDI Button</h2>

        <form onSubmit={handleFormSubmit} autoComplete="off" noValidate>
          <div className="space-y-4">
            <InputField
              error={errors.label}
              id="midi-label"
              label="Button label"
              placeholder="e.g., Verse, Chorus, Bridge"
              register={register('label', { required: 'Label is required' })}
              required
            />

            <SelectField
              error={errors.instrumentId}
              id="midi-instrument"
              label="Instrument"
              options={instrumentOptions}
              register={register('instrumentId', { required: 'Instrument is required' })}
              required
            />

            {hasSelectableOptions ? (
              <SelectField
                error={errors.programChange}
                id="midi-programChange"
                label="Program"
                options={programOptions}
                register={register('programChange', {
                  required: 'Program is required',
                  valueAsNumber: true,
                })}
                required
              />
            ) : (
              <InputField
                error={errors.programChange}
                id="midi-programChange"
                label="Program Change Number"
                max="511"
                min="0"
                placeholder="0-511"
                register={register('programChange', {
                  max: { message: 'Program change must be at most 511', value: 511 },
                  min: { message: 'Program change must be at least 0', value: 0 },
                  required: 'Program change is required',
                  valueAsNumber: true,
                })}
                required
                type="number"
              />
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button className="flex-1" onClick={onClose} type="button" variant="outlined">
              Cancel
            </Button>
            <Button
              color="primary"
              className="flex-1"
              iconStart={<IconPlus className="h-4 w-4" />}
              type="submit"
              variant="filled"
            >
              Add button
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
