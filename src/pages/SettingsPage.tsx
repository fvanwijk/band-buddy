import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { MidiDeviceStatus } from '../components/MidiDeviceStatus';
import { SelectField } from '../components/SelectField';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../config/locales';
import { THEMES, type ThemeName } from '../config/themes';
import { useAddInstrument, useGetInstruments } from '../hooks/useInstruments';
import { useMidiDevices } from '../hooks/useMidiDevices';
import { useGetLocale, useGetTheme, useSetLocale, useSetTheme } from '../hooks/useSettings';
import type { Instrument } from '../types';

// Color preview swatches for each theme
const themeColors = {
  emerald: {
    '200': 'oklch(0.905 0.093 164.15)',
    '400': 'oklch(0.765 0.177 163.223)',
    '600': 'oklch(0.596 0.145 163.225)',
  },
  orange: {
    '200': 'oklch(0.901 0.076 70.697)',
    '400': 'oklch(0.75 0.183 55.934)',
    '600': 'oklch(0.646 0.222 41.116)',
  },
  violet: {
    '200': 'oklch(0.894 0.057 293.283)',
    '400': 'oklch(0.702 0.183 293.541)',
    '600': 'oklch(0.541 0.281 293.009)',
  },
} as const;

function SettingsPage() {
  const currentTheme = useGetTheme();
  const currentLocale = useGetLocale();
  const setTheme = useSetTheme();
  const setLocale = useSetLocale();
  const instruments = useGetInstruments();
  const addInstrument = useAddInstrument();
  const { error, inputs, isReady, isSupported, outputs } = useMidiDevices();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const inputOptions = useMemo(
    () => [
      { label: 'Select MIDI input', value: '' },
      ...inputs.map((device) => ({
        label: device.name,
        value: device.id,
      })),
    ],
    [inputs],
  );

  const outputOptions = useMemo(
    () => [
      { label: 'None', value: '' },
      ...outputs.map((device) => ({
        label: device.name,
        value: device.id,
      })),
    ],
    [outputs],
  );

  const inputsById = useMemo(
    () => new Map(inputs.map((device) => [device.id, device.name])),
    [inputs],
  );

  const outputsById = useMemo(
    () => new Map(outputs.map((device) => [device.id, device.name])),
    [outputs],
  );

  const canAddInstrument = isSupported && isReady && inputs.length > 0;

  const handleAddInstrument = (data: { midiInId: string; midiOutId: string; name: string }) => {
    const trimmedName = data.name.trim();
    const midiInName = inputsById.get(data.midiInId) || data.midiInId;
    const midiOutName = data.midiOutId
      ? outputsById.get(data.midiOutId) || data.midiOutId
      : undefined;

    const newInstrument: Omit<Instrument, 'id'> = {
      midiInId: data.midiInId,
      midiInName,
      midiOutId: data.midiOutId || undefined,
      midiOutName,
      name: trimmedName,
    };

    addInstrument(newInstrument);

    reset();
    setIsDialogOpen(false);
  };

  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">Settings</p>
        <h1 className="text-2xl font-semibold text-slate-100">Preferences</h1>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Color Theme</h2>
        <p className="mt-2 text-sm text-slate-400">
          Choose your preferred color scheme. Based on triadic color harmony.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {Object.entries(THEMES).map(([key, theme]) => {
            const themeName = key as ThemeName;
            const isActive = currentTheme === themeName;

            return (
              <Button
                key={themeName}
                onClick={() => setTheme(themeName)}
                className={[
                  'group relative overflow-hidden rounded-xl border p-6 text-left transition block! p-3!',
                  isActive
                    ? 'border-brand-400 bg-brand-400/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600',
                ].join(' ')}
                variant="ghost"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">{theme.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {isActive ? 'Active theme' : 'Click to activate'}
                    </p>
                  </div>
                  {isActive && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-400/20">
                      <svg
                        className="h-3 w-3 text-brand-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  {(['200', '400', '600'] as const).map((shade) => (
                    <div
                      key={shade}
                      className="h-8 flex-1 rounded"
                      style={{
                        backgroundColor: themeColors[themeName][shade],
                      }}
                    />
                  ))}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Locale</h2>
        <p className="mt-2 text-sm text-slate-400">
          Select your preferred locale for date and number formatting.
        </p>

        <div className="mt-6">
          <SelectField
            id="locale-select"
            label="Locale"
            options={SUPPORTED_LOCALES.map(({ locale, name }) => ({
              label: name,
              value: locale,
            }))}
            value={currentLocale}
            onChange={(locale) => setLocale(locale as SupportedLocale)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Instruments</h2>
            <p className="mt-2 text-sm text-slate-400">
              Track connected instruments for program changes and MIDI device routing.
            </p>
          </div>
          <Button
            color="primary"
            iconStart={<IconPlus className="h-4 w-4" />}
            onClick={() => setIsDialogOpen(true)}
            disabled={!canAddInstrument}
            variant="outlined"
          >
            Add Instrument
          </Button>
        </div>

        {!isSupported && (
          <p className="mt-4 text-sm text-red-300">Web MIDI is not supported in this browser.</p>
        )}
        {isSupported && !isReady && (
          <p className="mt-4 text-sm text-slate-400">Detecting MIDI devices...</p>
        )}
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        {isSupported && isReady && inputs.length === 0 && (
          <p className="mt-4 text-sm text-slate-400">
            No MIDI inputs detected. Connect a device to enable adding instruments.
          </p>
        )}

        <div className="mt-6 space-y-3">
          {instruments.length === 0 ? (
            <p className="text-sm text-slate-400">No instruments added yet.</p>
          ) : (
            instruments.map((instrument) => {
              const midiInAvailable = inputsById.has(instrument.midiInId);
              const midiOutAvailable = instrument.midiOutId
                ? outputsById.has(instrument.midiOutId)
                : true;

              return (
                <div
                  key={instrument.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{instrument.name}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MidiDeviceStatus
                      label="MIDI In"
                      name={instrument.midiInName}
                      isAvailable={midiInAvailable}
                    />
                    {instrument.midiOutId ? (
                      <MidiDeviceStatus
                        label="MIDI Out"
                        name={instrument.midiOutName || instrument.midiOutId}
                        isAvailable={midiOutAvailable}
                      />
                    ) : (
                      <MidiDeviceStatus label="MIDI Out" name="None" isOptional />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsDialogOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-3 text-xl font-semibold text-slate-100">Add Instrument</h2>
            <form className="space-y-4" onSubmit={handleSubmit(handleAddInstrument)}>
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
                <Button
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                  type="button"
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  color="primary"
                  iconStart={<IconDeviceFloppy className="h-4 w-4" />}
                  type="submit"
                  variant="outlined"
                >
                  Add Instrument
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default SettingsPage;
