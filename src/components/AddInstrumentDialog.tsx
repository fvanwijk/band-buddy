import { useForm } from 'react-hook-form';

import { Button } from './Button';
import { FormField } from './FormField';
import { SelectField } from './SelectField';

type AddInstrumentDialogProps = {
  inputOptions: Array<{ label: string; value: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { midiInId: string; midiOutId: string; name: string }) => void;
  outputOptions: Array<{ label: string; value: string }>;
};

export function AddInstrumentDialog({
  inputOptions,
  isOpen,
  onClose,
  onSubmit,
  outputOptions,
}: AddInstrumentDialogProps) {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<{
    midiInId: string;
    midiOutId: string;
    name: string;
  }>({
    defaultValues: {
      midiInId: '',
      midiOutId: '',
      name: '',
    },
  });

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
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="mb-3 text-xl font-semibold text-slate-100">Add Instrument</h2>
        <p className="mb-6 text-sm text-slate-400">
          Select MIDI devices for this instrument. MIDI in is required.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
          <FormField
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
            <Button className="flex-1" color="primary" type="submit" variant="filled">
              Add Instrument
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
