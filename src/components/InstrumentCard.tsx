import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { Button } from './Button';
import { MidiDeviceStatus } from './MidiDeviceStatus';
import type { Instrument } from '../types';

type InstrumentCardProps = {
  inputsById: Map<string, string>;
  instrument: Instrument;
  outputsById: Map<string, string>;
  onDeleteClick: (id: string) => void;
};

export function InstrumentCard({
  inputsById,
  instrument,
  outputsById,
  onDeleteClick,
}: InstrumentCardProps) {
  const midiInAvailable = inputsById.has(instrument.midiInId);
  const midiOutAvailable = instrument.midiOutId ? outputsById.has(instrument.midiOutId) : true;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
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
            onClick={() => onDeleteClick(instrument.id)}
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
}
