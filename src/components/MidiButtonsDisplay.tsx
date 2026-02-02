import { IconZoomOut } from '@tabler/icons-react';

import { Button } from './Button';
import type { MidiEvent } from '../types';

type MidiButtonsDisplayProps = {
  midiEvents?: MidiEvent[];
  onTriggerEvent?: (event: MidiEvent) => void;
};

export function MidiButtonsDisplay({ midiEvents, onTriggerEvent }: MidiButtonsDisplayProps) {
  if (!midiEvents || midiEvents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
        <IconZoomOut className="mx-auto mb-2 h-8 w-8 opacity-50" />
        No MIDI buttons configured yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {midiEvents.map((event) => (
          <Button
            key={event.id}
            color="primary"
            onClick={() => onTriggerEvent?.(event)}
            variant="filled"
          >
            {event.label}
          </Button>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Click buttons to send MIDI program change events to the selected instrument.
      </p>
    </div>
  );
}
