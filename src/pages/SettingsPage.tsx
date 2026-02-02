import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InstrumentDialog } from '../components/InstrumentDialog';
import { MidiDeviceStatus } from '../components/MidiDeviceStatus';
import { SelectField } from '../components/SelectField';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../config/locales';
import { THEMES, type ThemeName } from '../config/themes';
import {
  useAddInstrument,
  useDeleteInstrument,
  useGetInstruments,
  useUpdateInstrument,
} from '../hooks/useInstruments';
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
  const deleteInstrument = useDeleteInstrument();
  const { error, inputs, isReady, isSupported, outputs } = useMidiDevices();

  const [deleteInstrumentId, setDeleteInstrumentId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstrumentId, setEditingInstrumentId] = useState<string | null>(null);
  const updateInstrument = useUpdateInstrument(editingInstrumentId || undefined);

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

  const editingInstrument = useMemo(
    () => instruments.find((instrument) => instrument.id === editingInstrumentId),
    [editingInstrumentId, instruments],
  );

  const deleteInstrumentTarget = useMemo(
    () => instruments.find((instrument) => instrument.id === deleteInstrumentId),
    [deleteInstrumentId, instruments],
  );

  const canAddInstrument = isSupported && isReady && inputs.length > 0;

  const handleAddInstrument = (data: { midiInId: string; midiOutId: string; name: string }) => {
    const trimmedName = data.name.trim();
    const midiInName = inputsById.get(data.midiInId) || data.midiInId;
    const midiOutName = data.midiOutId
      ? outputsById.get(data.midiOutId) || data.midiOutId
      : undefined;

    const instrumentData: Omit<Instrument, 'id'> = {
      midiInId: data.midiInId,
      midiInName,
      midiOutId: data.midiOutId || undefined,
      midiOutName,
      name: trimmedName,
    };

    if (editingInstrumentId) {
      updateInstrument(instrumentData);
    } else {
      addInstrument(instrumentData);
    }

    setIsDialogOpen(false);
    setEditingInstrumentId(null);
  };

  const handleEditInstrument = (id: string) => {
    setEditingInstrumentId(id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInstrumentId(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteInstrumentId(null);
  };

  const handleConfirmDeleteInstrument = () => {
    if (deleteInstrumentId) {
      deleteInstrument(deleteInstrumentId);
    }
    setDeleteInstrumentId(null);
  };

  const handleRequestDeleteInstrument = (id: string) => {
    setDeleteInstrumentId(id);
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
                  'group relative overflow-hidden rounded-xl border text-left transition block! p-3!',
                  isActive
                    ? 'border-brand-400 bg-brand-400/10 '
                    : 'border-slate-700 bg-slate-800/50  hover:border-slate-600',
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
            disabled={!canAddInstrument}
            iconStart={<IconPlus className="h-4 w-4" />}
            onClick={() => {
              setEditingInstrumentId(null);
              setIsDialogOpen(true);
            }}
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

        {isSupported && isReady && outputs.length === 0 && (
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
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-100">{instrument.name}</p>
                    <div className="flex gap-2">
                      <Button
                        color="primary"
                        icon
                        onClick={() => handleEditInstrument(instrument.id)}
                        variant="outlined"
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        color="danger"
                        icon
                        onClick={() => handleRequestDeleteInstrument(instrument.id)}
                        variant="outlined"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MidiDeviceStatus
                      isAvailable={midiInAvailable}
                      label="MIDI In"
                      name={instrument.midiInName}
                    />
                    {instrument.midiOutId ? (
                      <MidiDeviceStatus
                        isAvailable={midiOutAvailable}
                        label="MIDI Out"
                        name={instrument.midiOutName || instrument.midiOutId || 'Unknown'}
                      />
                    ) : (
                      <MidiDeviceStatus isOptional label="MIDI Out" name="None" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteInstrumentId}
        message={`Are you sure you want to delete "${
          deleteInstrumentTarget?.name || 'this instrument'
        }"? This cannot be undone.`}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteInstrument}
        title="Delete instrument"
      />
      <InstrumentDialog
        initialInstrument={editingInstrument}
        inputOptions={inputOptions}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleAddInstrument}
        outputOptions={outputOptions}
      />
    </section>
  );
}

export default SettingsPage;
