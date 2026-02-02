import { IconZoomOut } from '@tabler/icons-react';

import { Button } from './Button';
import type { MidiEvent } from '../types';

type MidiButtonsDisplayProps = {
  isDisabled?: (event: MidiEvent) => boolean;
  midiEvents?: MidiEvent[];
  onTriggerEvent?: (event: MidiEvent) => void;
};

export function MidiButtonsDisplay({
  isDisabled,
  midiEvents,
  onTriggerEvent,
}: MidiButtonsDisplayProps) {
  if (!midiEvents || midiEvents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
        <IconZoomOut className="mx-auto mb-2 h-8 w-8 opacity-50" />
        No MIDI buttons configured yet.
      </div>
    );
  }

  const hasDisabled = !!isDisabled && midiEvents.some((event) => isDisabled(event));

  return (
    <div className="space-y-4">
      {hasDisabled && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Some MIDI buttons are disabled because their MIDI device is not available.
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {midiEvents.map((event) => (
          <Button
            key={event.id}
            color="primary"
            disabled={isDisabled?.(event)}
            onClick={() => onTriggerEvent?.(event)}
            className="h-24 rounded-lg text-xl!"
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
