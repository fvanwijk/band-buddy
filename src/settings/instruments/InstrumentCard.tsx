import type { Instrument } from '../../types';
import { DeleteButton } from '../../ui/DeleteButton';
import { EditButton } from '../../ui/EditButton';
import { MidiDeviceStatus } from './MidiDeviceStatus';

type InstrumentCardProps = {
  inputsById: Map<string, string>;
  instrument: Instrument;
  outputsById: Map<string, string>;
  onDeleteClick: (id: string) => void;
};

const allMidiChannels = Array.from({ length: 16 }, (_, index) => index + 1);

export function InstrumentCard({
  inputsById,
  instrument,
  outputsById,
  onDeleteClick,
}: InstrumentCardProps) {
  const midiChannels =
    instrument.midiChannels && instrument.midiChannels.length > 0
      ? instrument.midiChannels
          .filter((channel) => Number.isInteger(channel) && channel >= 1 && channel <= 16)
          .sort((a, b) => a - b)
      : [1];
  const selectedChannels = new Set(midiChannels);
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
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500">MIDI Channels</p>
        <div className="flex flex-wrap gap-1" role="list" aria-label="MIDI channels">
          {allMidiChannels.map((channel) => {
            const isSelected = selectedChannels.has(channel);

            return (
              <span
                aria-label={`Channel ${channel}${isSelected ? ' active' : ''}`}
                className={`inline-flex h-5 w-5 items-center justify-center rounded-xs text-[10px] leading-none font-semibold ${
                  isSelected ? 'bg-brand-900 text-white' : 'bg-slate-800 text-slate-400'
                }`}
                key={channel}
                role="listitem"
              >
                {channel}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
