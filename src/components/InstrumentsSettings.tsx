import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from './Alert';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';
import { MidiDeviceStatus } from './MidiDeviceStatus';
import { useDeleteInstrument, useGetInstruments } from '../hooks/useInstruments';
import { useMidiDevices } from '../hooks/useMidiDevices';

export function InstrumentsSettings() {
  const instruments = useGetInstruments();
  const deleteInstrument = useDeleteInstrument();
  const { error, inputs, isReady, isSupported, outputs } = useMidiDevices();
  const [deleteInstrumentId, setDeleteInstrumentId] = useState<string | null>(null);

  const deleteInstrumentTarget = instruments.find(
    (instrument) => instrument.id === deleteInstrumentId,
  );

  const handleCloseDeleteDialog = () => {
    setDeleteInstrumentId(null);
  };

  const handleDeleteInstrument = (id: string) => {
    setDeleteInstrumentId(id);
  };

  const inputsById = useMemo(
    () => new Map(outputs.map((device) => [device.id, device.name])),
    [outputs],
  );

  const outputsById = useMemo(
    () => new Map(inputs.map((device) => [device.id, device.name])),
    [inputs],
  );

  const canAddInstrument = isSupported && isReady && inputs.length > 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Instruments</h2>
          <p className="mt-2 text-sm text-slate-400">
            Track connected instruments for program changes and MIDI device routing.
          </p>
        </div>
        {canAddInstrument ? (
          <Button
            as={Link}
            color="primary"
            iconStart={<IconPlus className="h-4 w-4" />}
            to="/settings/instruments/add"
            variant="outlined"
          >
            Add Instrument
          </Button>
        ) : (
          <Button
            color="primary"
            disabled
            iconStart={<IconPlus className="h-4 w-4" />}
            variant="outlined"
          >
            Add Instrument
          </Button>
        )}
      </div>

      {!isSupported && (
        <p className="mt-4 text-sm text-red-300">Web MIDI is not supported in this browser.</p>
      )}
      {isSupported && !isReady && (
        <p className="mt-4 text-sm text-slate-400">Detecting MIDI devices...</p>
      )}
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      {isSupported && isReady && outputs.length === 0 && (
        <div className="mt-4">
          <Alert severity="warning">
            No MIDI inputs detected. Connect a device to enable adding instruments.
          </Alert>
        </div>
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
                      as={Link}
                      color="primary"
                      icon
                      to={`/settings/instruments/${instrument.id}/edit`}
                      variant="outlined"
                    >
                      <IconPencil className="h-4 w-4" />
                    </Button>
                    <Button
                      color="danger"
                      icon
                      onClick={() => handleDeleteInstrument(instrument.id)}
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

      <ConfirmDialog
        isOpen={!!deleteInstrumentId}
        message={`Are you sure you want to delete "${
          deleteInstrumentTarget?.name || 'this instrument'
        }"? This cannot be undone.`}
        onClose={handleCloseDeleteDialog}
        onConfirm={() => {
          if (deleteInstrumentId) {
            deleteInstrument(deleteInstrumentId);
          }
          setDeleteInstrumentId(null);
        }}
        title="Delete instrument"
      />
    </div>
  );
}
