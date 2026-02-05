import { MidiDeviceStatus } from './MidiDeviceStatus';
import type { Instrument } from '../../types';
import { DeleteButton } from '../../ui/DeleteButton';
import { EditButton } from '../../ui/EditButton';

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
          <EditButton title="Edit instrument" to={`/settings/instruments/${instrument.id}/edit`} />
          <DeleteButton onClick={() => onDeleteClick(instrument.id)} title="Delete instrument" />
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
