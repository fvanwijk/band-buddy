import { IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import { WebMidi } from 'webmidi';

import type { Instrument, MidiEvent } from '../../../types';
import { Button } from '../../../ui/Button';

type MidiButtonCardProps = {
  event: MidiEvent;
  instrument?: Instrument;
  isAvailable: boolean;
  onDelete: (eventId: string) => void;
};

export function MidiButtonCard({ event, instrument, isAvailable, onDelete }: MidiButtonCardProps) {
  const output = instrument?.midiInId ? WebMidi.getOutputById(instrument.midiInId) : undefined;

  const handleTestEvent = (event: MidiEvent) => {
    output?.sendProgramChange(event.programChange);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <div className="flex-1">
        <p className="font-medium text-slate-200">{event.label}</p>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <span>Program Change {event.programChange} →</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}
            />
            {instrument?.name || 'Unknown'}
          </span>
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          disabled={!isAvailable || !output}
          icon
          onClick={() => handleTestEvent(event)}
          title="Test MIDI button"
          type="button"
          variant="outlined"
        >
          <IconPlayerPlay className="h-4 w-4" />
        </Button>
        <Button color="danger" icon onClick={() => onDelete(event.id)} variant="outlined">
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
