import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { Instrument } from '../../types';
import { Button } from '../../ui/Button';
import { InputField } from '../../ui/form/InputField';
import { SelectField } from '../../ui/form/SelectField';

type InstrumentDialogProps = {
  inputOptions: Array<{ label: string; value: string }>;
  initialInstrument?: Instrument;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { midiInId: string; midiOutId: string; name: string }) => void;
  outputOptions: Array<{ label: string; value: string }>;
};

export function InstrumentDialog({
  inputOptions,
  initialInstrument,
  isOpen,
  onClose,
  onSubmit,
  outputOptions,
}: InstrumentDialogProps) {
  const isEditing = !!initialInstrument;

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<{
    midiInId: string;
    midiOutId: string;
    name: string;
  }>({
    defaultValues: {
      midiInId: initialInstrument?.midiInId || '',
      midiOutId: initialInstrument?.midiOutId || '',
      name: initialInstrument?.name || '',
    },
  });

  useEffect(() => {
    if (isOpen && initialInstrument) {
      setValue('midiInId', initialInstrument.midiInId);
      setValue('midiOutId', initialInstrument.midiOutId || '');
      setValue('name', initialInstrument.name);
    } else if (isOpen && !initialInstrument) {
      reset();
    }
  }, [isOpen, initialInstrument, setValue, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: { midiInId: string; midiOutId: string; name: string }) => {
    onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="mb-6 text-xl font-semibold text-slate-100">
          {isEditing ? 'Edit Instrument' : 'Add Instrument'}
        </h2>

        <form
          autoComplete="off"
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <InputField
            error={errors.name}
            id="instrument-name"
            label="Instrument Name"
            placeholder="Enter instrument name"
            register={register('name', { required: 'Instrument name is required' })}
            required
          />

          <SelectField
            error={errors.midiInId}
            id="midi-in"
            label="MIDI In"
            options={inputOptions}
            register={register('midiInId', { required: 'MIDI in is required' })}
            required
          />

          <SelectField
            id="midi-out"
            label="MIDI Out (Optional)"
            options={outputOptions}
            register={register('midiOutId')}
          />

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleClose} type="button" variant="outlined">
              Cancel
            </Button>
            <Button
              className="flex-1"
              color="primary"
              iconStart={<IconDeviceFloppy className="h-4 w-4" />}
              type="submit"
              variant="filled"
            >
              {isEditing ? 'Save instrument' : 'Add instrument'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
