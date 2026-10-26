import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useMidiDevices } from '../../../midi/useMidiDevices';
import { Grid } from '../../../settings/Grid';
import type { Instrument, MidiButtonEvent, MidiEvent } from '../../../types';
import { Alert } from '../../../ui/Alert';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { MidiButtonCard } from './MidiButtonCard';
import { MidiButtonDialog } from './MidiButtonDialog';
import { MidiButtonTriggersFormSection } from './MidiButtonTriggersFormSection';

type MidiButtonTriggerInput = Omit<MidiButtonEvent, 'id' | 'type'>;

type MidiButtonsTabProps = {
  instruments: Instrument[];
  midiButtonTriggers?: MidiButtonEvent[];
  midiEvents?: MidiEvent[];
  onAddMidiButtonTrigger?: (trigger: MidiButtonTriggerInput) => void;
  onAddEvent?: (event: Omit<MidiEvent, 'id'>) => void;
  onDeleteMidiButtonTrigger?: (triggerId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onEditMidiButtonTrigger?: (triggerId: string, trigger: MidiButtonTriggerInput) => void;
  onEditEvent?: (eventId: string, event: Omit<MidiEvent, 'id'>) => void;
};

export function MidiButtonsTab({
  instruments,
  midiButtonTriggers,
  midiEvents,
  onAddMidiButtonTrigger,
  onAddEvent,
  onDeleteMidiButtonTrigger,
  onDeleteEvent,
  onEditMidiButtonTrigger,
  onEditEvent,
}: MidiButtonsTabProps) {
  const hasMidiEvents = (midiEvents?.length ?? 0) > 0;
  const [editingEvent, setEditingEvent] = useState<MidiEvent | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isReady, outputs } = useMidiDevices();

  const handleDialogClose = () => {
    setEditingEvent(undefined);
    setIsDialogOpen(false);
  };

  const handleDialogSubmit = (event: Omit<MidiEvent, 'id'>) => {
    if (editingEvent) {
      onEditEvent?.(editingEvent.id, event);
    } else {
      onAddEvent?.(event);
    }

    handleDialogClose();
  };

  const handleOpenAddDialog = () => {
    setEditingEvent(undefined);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (event: MidiEvent) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const outputsById = new Map(outputs.map((output) => [output.id, output]));
  return (
    <Card>
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

      <MidiButtonDialog
        initialData={
          editingEvent
            ? {
                events: editingEvent.events,
                label: editingEvent.label,
              }
            : undefined
        }
        instruments={instruments}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
      />

      {/* Buttons List */}
      <div>
        <p className="mb-3 text-xs text-slate-500">
          Create buttons that send MIDI messages to your instruments. During a performance, click
          these buttons to instantly switch sounds and trigger instrument parameters on your
          connected MIDI devices.
        </p>

        <div className="mb-3 flex items-center gap-4">
          <h3 className="text-sm font-semibold text-slate-200">MIDI Buttons</h3>
          <Button
            color="primary"
            isIcon
            onClick={handleOpenAddDialog}
            title="Add MIDI button"
            type="button"
            variant="outlined"
          >
            <IconPlus className="h-4 w-4" />
          </Button>
        </div>
        {!hasMidiEvents ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-center text-sm text-slate-400">
            No MIDI buttons yet.{' '}
            <button className="link" onClick={handleOpenAddDialog} type="button">
              Create one
            </button>
            .
          </div>
        ) : (
          <Grid>
            {midiEvents?.map((event) => {
              const isAvailable =
                isReady &&
                event.events.every((action) => {
                  const instrument = instruments.find((inst) => inst.id === action.instrumentId);
                  return !!instrument?.midiInId && outputsById.has(instrument.midiInId);
                });
              return (
                <MidiButtonCard
                  key={event.id}
                  event={event}
                  instruments={instruments}
                  isAvailable={isAvailable}
                  onDelete={() => onDeleteEvent?.(event.id)}
                  onEdit={handleOpenEditDialog}
                />
              );
            })}
          </Grid>
        )}
      </div>

      <MidiButtonTriggersFormSection
        midiButtonTriggers={midiButtonTriggers}
        midiEvents={midiEvents}
        onAddMidiButtonTrigger={onAddMidiButtonTrigger}
        onDeleteMidiButtonTrigger={onDeleteMidiButtonTrigger}
        onEditMidiButtonTrigger={onEditMidiButtonTrigger}
      />
    </Card>
  );
}
