import { IconPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { InstrumentCard } from './InstrumentCard';
import { useDeleteInstrument, useGetInstruments } from '../../api/useInstruments';
import { useMidiDevices } from '../../midi/useMidiDevices';
import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { SettingsCard } from '../SettingsCard';

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
    <SettingsCard>
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
        <p className="mt-4 text-sm text-red-300">Web MIDI is not supported on this device.</p>
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
          <Alert severity="info">No instruments added yet.</Alert>
        ) : (
          instruments.map((instrument) => (
            <InstrumentCard
              key={instrument.id}
              inputsById={inputsById}
              instrument={instrument}
              outputsById={outputsById}
              onDeleteClick={handleDeleteInstrument}
            />
          ))
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
    </SettingsCard>
  );
}
