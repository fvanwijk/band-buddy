import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { AddMidiButtonDialog } from './AddMidiButtonDialog';
import { Button } from './Button';
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

  const handleAddEvent = (event: Omit<MidiEvent, 'id'>) => {
    onAddEvent?.(event);
  };

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
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-200">{event.label}</p>
                    <p className="text-xs text-slate-500">
                      Program Change {event.programChange} → {instrument?.name || 'Unknown'}
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
