import { IconPlus } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';

import type { Instrument, MidiEvent } from '../../../types';
import { Button } from '../../../ui/Button';
import { Dialog } from '../../../ui/Dialog';
import { InputField } from '../../../ui/form/InputField';
import { SelectField } from '../../../ui/form/SelectField';
import { useProgramOptions } from './useProgramOptions';

type FormData = Omit<MidiEvent, 'id'>;

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
  } = useForm<FormData>({
    defaultValues: {
      instrumentId: initialData?.instrumentId || instruments[0]?.id || '',
      label: initialData?.label || '',
      programChange: initialData?.programChange ?? 0,
    },
    mode: 'all',
  });

  const selectedInstrumentId = useWatch({ control, name: 'instrumentId' });

  const selectedInstrument = instruments.find((inst) => inst.id === selectedInstrumentId);
  const programOptions = useProgramOptions(selectedInstrument);
  const hasSelectableOptions = programOptions.length > 0;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      instrumentId: initialData?.instrumentId || instruments[0]?.id || '',
      label: initialData?.label || '',
      programChange: initialData?.programChange ?? 0,
    });
  }, [initialData, instruments, isOpen, reset]);

  const handleAdd = (data: FormData) => {
    onSubmit(data);
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

          <SelectField
            error={errors.instrumentId}
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
            label="Instrument"
            options={instrumentOptions}
            {...register('instrumentId', { required: 'Instrument is required' })}
            required
          />

          {hasSelectableOptions ? (
            <SelectField
              error={errors.programChange}
              label="Program"
              options={programOptions}
              {...register('programChange', {
                required: 'Program is required',
                valueAsNumber: true,
              })}
              required
            />
          ) : (
            <InputField
              error={errors.programChange}
              label="Program Change number"
              max="511"
              min="0"
              placeholder="0-511"
              {...register('programChange', {
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
