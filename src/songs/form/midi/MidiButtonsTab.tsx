import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { AddMidiButtonDialog } from './AddMidiButtonDialog';
import { MidiButtonCard } from './MidiButtonCard';
import { useMidiDevices } from '../../../midi/useMidiDevices';
import type { Instrument, MidiEvent } from '../../../types';
import { Alert } from '../../../ui/Alert';
import { Button } from '../../../ui/Button';

type MidiButtonsTabProps = {
  instruments: Instrument[];
  midiEvents?: MidiEvent[];
  onAddEvent?: (event: Omit<MidiEvent, 'id'>) => void;
  onDeleteEvent?: (eventId: string) => void;
};

export function MidiButtonsTab({
  instruments,
  midiEvents,
  onAddEvent,
  onDeleteEvent,
}: MidiButtonsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isReady, outputs } = useMidiDevices();

  const handleAddEvent = (event: Omit<MidiEvent, 'id'>) => {
    onAddEvent?.(event);
  };

  const outputsById = new Map(outputs.map((output) => [output.id, output]));

  return (
    <div className="space-y-6">
      {instruments.length === 0 && (
        <Alert severity="info">
          <p>
            Configure MIDI instruments in{' '}
            <Link className="underline hover:text-sky-300" to="/settings/instruments">
              Settings → Instruments
            </Link>{' '}
            to create MIDI buttons.
          </p>
        </Alert>
      )}

      <AddMidiButtonDialog
        instruments={instruments}
        isOpen={isDialogOpen}
        onAdd={handleAddEvent}
        onClose={() => setIsDialogOpen(false)}
      />

      {/* Buttons List */}
      <div>
        <p className="mb-3 text-xs text-slate-500">
          Create buttons that send MIDI program changes to your instruments. During a performance,
          click these buttons to instantly switch sounds and effects on your connected MIDI devices.
        </p>

        <div className="mb-3 flex items-center gap-4">
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
            No MIDI buttons yet.{' '}
            <button className="link" onClick={() => setIsDialogOpen(true)} type="button">
              Create one
            </button>
            .
          </div>
        ) : (
          <div className="space-y-2">
            {midiEvents.map((event) => {
              const instrument = instruments.find((inst) => inst.id === event.instrumentId);
              const isAvailable =
                isReady && !!instrument?.midiInId && outputsById.has(instrument.midiInId);
              return (
                <MidiButtonCard
                  key={event.id}
                  event={event}
                  instrument={instrument}
                  isAvailable={isAvailable}
                  onDelete={() => onDeleteEvent?.(event.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
