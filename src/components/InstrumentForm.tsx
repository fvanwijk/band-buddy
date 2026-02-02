import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { BackButton } from './BackButton';
import { Button } from './Button';
import { InputField } from './InputField';
import { Page } from './Page';
import { PageHeader } from './PageHeader';
import { SelectField } from './SelectField';
import { useMidiDevices } from '../hooks/useMidiDevices';
import type { Instrument } from '../types';

type InstrumentFormData = {
  midiInId: string;
  midiOutId: string;
  name: string;
};

type InstrumentFormProps = {
  backPath: string;
  initialData?: Instrument;
  onSubmit: (data: {
    midiInId: string;
    midiInName: string;
    midiOutId?: string;
    midiOutName?: string;
    name: string;
  }) => void;
  title: string;
};

export function InstrumentForm({ backPath, initialData, onSubmit, title }: InstrumentFormProps) {
  const { inputs, isReady, isSupported, outputs } = useMidiDevices();

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<InstrumentFormData>({
    defaultValues: {
      midiInId: initialData?.midiInId || '',
      midiOutId: initialData?.midiOutId || '',
      name: initialData?.name || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      setValue('midiInId', initialData.midiInId);
      setValue('midiOutId', initialData.midiOutId || '');
      setValue('name', initialData.name);
    }
  }, [initialData, setValue]);

  // Important: Input and output options are swapped because
  // the MIDI input of the computer (=webmidi package) corresponds to the output of the instrument and vice versa.
  const inputOptions = useMemo(
    () => [
      { label: 'Select MIDI input', value: '' },
      ...outputs.map((device) => ({
        label: device.name,
        value: device.id,
      })),
    ],
    [outputs],
  );

  const outputOptions = useMemo(
    () => [
      { label: 'None', value: '' },
      ...inputs.map((device) => ({
        label: device.name,
        value: device.id,
      })),
    ],
    [inputs],
  );

  const inputsById = useMemo(
    () => new Map(outputs.map((device) => [device.id, device.name])),
    [outputs],
  );

  const outputsById = useMemo(
    () => new Map(inputs.map((device) => [device.id, device.name])),
    [inputs],
  );

  const handleFormSubmit = (data: InstrumentFormData) => {
    const trimmedName = data.name.trim();
    const midiInName = inputsById.get(data.midiInId) || data.midiInId;
    const midiOutName = data.midiOutId
      ? outputsById.get(data.midiOutId) || data.midiOutId
      : undefined;

    onSubmit({
      midiInId: data.midiInId,
      midiInName,
      midiOutId: data.midiOutId || undefined,
      midiOutName,
      name: trimmedName,
    });
  };

  if (!isSupported) {
    return (
      <Page>
        <div className="flex items-center gap-3">
          <BackButton to={backPath} />
          <PageHeader subtitle="Settings" title={title} />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-sm text-red-300">Web MIDI is not supported in this browser.</p>
        </div>
      </Page>
    );
  }

  if (!isReady) {
    return (
      <Page>
        <div className="flex items-center gap-3">
          <BackButton to={backPath} />
          <PageHeader subtitle="Settings" title={title} />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-sm text-slate-400">Detecting MIDI devices...</p>
        </div>
      </Page>
    );
  }

  if (outputs.length === 0) {
    return (
      <Page>
        <div className="flex items-center gap-3">
          <BackButton to={backPath} />
          <PageHeader subtitle="Settings" title={title} />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-sm text-slate-400">
            No MIDI inputs detected. Connect a device to add instruments.
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="flex items-center gap-3">
        <BackButton to={backPath} />
        <PageHeader subtitle="Settings" title={title} />
      </div>

      <form
        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <div className="space-y-4">
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
        </div>

        <div className="mt-6 flex gap-3">
          <Button as="a" className="flex-1" href={backPath} variant="outlined">
            Cancel
          </Button>
          <Button
            className="flex-1"
            color="primary"
            iconStart={<IconDeviceFloppy className="w-4 h-4" />}
            type="submit"
            variant="filled"
          >
            {initialData ? 'Save instrument' : 'Add instrument'}
          </Button>
        </div>
      </form>
    </Page>
  );
}
