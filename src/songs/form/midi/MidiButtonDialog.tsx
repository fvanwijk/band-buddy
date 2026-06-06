import { IconPlus } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import type { Instrument, MidiEvent } from '../../../types';
import { Button } from '../../../ui/Button';
import { Dialog } from '../../../ui/Dialog';
import { InputField } from '../../../ui/form/InputField';
import { MidiEventRow } from './MidiEventRow';

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
      events: initialData?.events || [
        {
          instrumentId: instruments[0]?.id || '',
          programChange: 0,
        },
      ],
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
      name: 'events',
    }) || [];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      events: initialData?.events || [
        {
          instrumentId: instruments[0]?.id || '',
          programChange: 0,
        },
      ],
      label: initialData?.label || '',
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
      contentClassName="max-w-3xl"
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
                selectedInstrumentId={selectedEvents[index]?.instrumentId}
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
