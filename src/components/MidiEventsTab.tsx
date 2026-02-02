import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { AddMidiButtonDialog } from './AddMidiButtonDialog';
import { Button } from './Button';
import { useMidiDevices } from '../hooks/useMidiDevices';
import type { Instrument, MidiEvent } from '../types';

type MidiEventsTabProps = {
  instruments: Instrument[];
  midiEvents?: MidiEvent[];
  onAddEvent?: (event: Omit<MidiEvent, 'id'>) => void;
  onDeleteEvent?: (eventId: string) => void;
};

export function MidiEventsTab({
  instruments,
  midiEvents,
  onAddEvent,
  onDeleteEvent,
}: MidiEventsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isReady, outputs } = useMidiDevices();

  const handleAddEvent = (event: Omit<MidiEvent, 'id'>) => {
    onAddEvent?.(event);
  };

  const outputsById = new Map(outputs.map((output) => [output.id, output]));

  return (
    <div className="space-y-6">
      <AddMidiButtonDialog
        instruments={instruments}
        isOpen={isDialogOpen}
        onAdd={handleAddEvent}
        onClose={() => setIsDialogOpen(false)}
      />

      {/* Events List */}
      <div>
        <div className="flex items-center gap-4 mb-3">
          <h3 className="text-sm font-semibold text-slate-200">MIDI Buttons </h3>
          <Button
            color="primary"
            icon
            onClick={() => setIsDialogOpen(true)}
            type="button"
            variant="outlined"
          >
            <IconPlus className="h-4 w-4" />
          </Button>
        </div>
        {!midiEvents || midiEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-center text-sm text-slate-400">
            No MIDI buttons yet. Create one above.
          </div>
        ) : (
          <div className="space-y-2">
            {midiEvents.map((event) => {
              const instrument = instruments.find((inst) => inst.id === event.instrumentId);
              const isAvailable =
                isReady && instrument?.midiInId && outputsById.has(instrument.midiInId);
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-200">{event.label}</p>
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Program Change {event.programChange} →</span>
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isAvailable ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        {instrument?.name || 'Unknown'}
                      </span>
                    </p>
                  </div>
                  <Button
                    color="danger"
                    icon
                    onClick={() => onDeleteEvent?.(event.id)}
                    variant="outlined"
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
