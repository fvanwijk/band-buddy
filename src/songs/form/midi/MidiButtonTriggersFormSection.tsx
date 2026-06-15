import { IconPlus, IconTrash } from '@tabler/icons-react';

import type { MidiButtonTrigger, MidiEvent } from '../../../types';
import { Alert } from '../../../ui/Alert';
import { Button } from '../../../ui/Button';

type MidiButtonTriggersFormSectionProps = {
  midiButtonTriggers?: MidiButtonTrigger[];
  midiEvents?: MidiEvent[];
  onAddMidiButtonTrigger?: (trigger: Omit<MidiButtonTrigger, 'id'>) => void;
  onDeleteMidiButtonTrigger?: (triggerId: string) => void;
  onEditMidiButtonTrigger?: (triggerId: string, trigger: Omit<MidiButtonTrigger, 'id'>) => void;
};

export function MidiButtonTriggersFormSection({
  midiButtonTriggers,
  midiEvents,
  onAddMidiButtonTrigger,
  onDeleteMidiButtonTrigger,
  onEditMidiButtonTrigger,
}: MidiButtonTriggersFormSectionProps) {
  const availableMidiEvents = midiEvents ?? [];
  const configuredMidiButtonTriggers = midiButtonTriggers ?? [];
  const hasMidiEvents = (midiEvents?.length ?? 0) > 0;
  const hasMidiButtonTriggers = (midiButtonTriggers?.length ?? 0) > 0;

  const handleAddTrigger = () => {
    if (!hasMidiEvents) {
      return;
    }

    onAddMidiButtonTrigger?.({
      beat: 1,
      measure: 1,
      midiEventId: availableMidiEvents[0].id,
    });
  };

  return (
    <div>
      <p className="mb-3 text-xs text-slate-500">
        Add automatic triggers to fire MIDI buttons at a specific measure and beat while the
        metronome or sequencer is running.
      </p>
      <div className="mb-3 flex items-center gap-4">
        <h3 className="text-sm font-semibold text-slate-200">MIDI Button Triggers</h3>
        <Button
          color="primary"
          disabled={!hasMidiEvents}
          isIcon
          onClick={handleAddTrigger}
          title="Add MIDI button trigger"
          type="button"
          variant="outlined"
        >
          <IconPlus className="h-4 w-4" />
        </Button>
      </div>

      {!hasMidiEvents && (
        <Alert severity="info">
          Create at least one MIDI button before adding automatic triggers.
        </Alert>
      )}

      {!hasMidiButtonTriggers && hasMidiEvents ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-center text-sm text-slate-400">
          No automatic triggers yet.
        </div>
      ) : null}

      {hasMidiButtonTriggers && hasMidiEvents ? (
        <div className="space-y-2">
          {configuredMidiButtonTriggers.map((trigger) => (
            <div
              className="grid grid-cols-1 items-end gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 sm:grid-cols-[1fr_140px_120px_auto]"
              key={trigger.id}
            >
              <div>
                <label
                  className="mb-1.5 block text-xs text-slate-300"
                  htmlFor={`trigger-event-${trigger.id}`}
                >
                  Button
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                  id={`trigger-event-${trigger.id}`}
                  onChange={(event) => {
                    onEditMidiButtonTrigger?.(trigger.id, {
                      beat: trigger.beat,
                      measure: trigger.measure,
                      midiEventId: event.target.value,
                    });
                  }}
                  value={trigger.midiEventId}
                >
                  {availableMidiEvents.map((midiEvent) => (
                    <option key={midiEvent.id} value={midiEvent.id}>
                      {midiEvent.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs text-slate-300"
                  htmlFor={`trigger-measure-${trigger.id}`}
                >
                  Measure
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                  id={`trigger-measure-${trigger.id}`}
                  min={1}
                  onChange={(event) => {
                    onEditMidiButtonTrigger?.(trigger.id, {
                      beat: trigger.beat,
                      measure: Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                      midiEventId: trigger.midiEventId,
                    });
                  }}
                  type="number"
                  value={trigger.measure}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs text-slate-300"
                  htmlFor={`trigger-beat-${trigger.id}`}
                >
                  Beat
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                  id={`trigger-beat-${trigger.id}`}
                  min={1}
                  onChange={(event) => {
                    onEditMidiButtonTrigger?.(trigger.id, {
                      beat: Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                      measure: trigger.measure,
                      midiEventId: trigger.midiEventId,
                    });
                  }}
                  type="number"
                  value={trigger.beat}
                />
              </div>

              <Button
                color="danger"
                isIcon
                onClick={() => onDeleteMidiButtonTrigger?.(trigger.id)}
                title="Delete MIDI button trigger"
                type="button"
                variant="outlined"
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
