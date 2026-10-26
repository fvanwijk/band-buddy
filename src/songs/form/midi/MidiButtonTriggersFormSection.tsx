import { IconPlus, IconTrash } from '@tabler/icons-react';

import type { MidiButtonEvent, MidiEvent } from '../../../types';
import { Alert } from '../../../ui/Alert';
import { Button } from '../../../ui/Button';
import { InputField } from '../../../ui/form/InputField';
import { SelectField } from '../../../ui/form/SelectField';

type MidiButtonTriggerInput = Omit<MidiButtonEvent, 'id' | 'type'>;

type MidiButtonTriggersFormSectionProps = {
  midiButtonTriggers?: MidiButtonEvent[];
  midiEvents?: MidiEvent[];
  onAddMidiButtonTrigger?: (trigger: MidiButtonTriggerInput) => void;
  onDeleteMidiButtonTrigger?: (triggerId: string) => void;
  onEditMidiButtonTrigger?: (triggerId: string, trigger: MidiButtonTriggerInput) => void;
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
              <SelectField
                id={`trigger-event-${trigger.id}`}
                label="Button"
                onChange={(event) => {
                  onEditMidiButtonTrigger?.(trigger.id, {
                    beat: trigger.beat,
                    measure: trigger.measure,
                    midiEventId: event.target.value,
                  });
                }}
                options={availableMidiEvents.map((midiEvent) => ({
                  label: midiEvent.label,
                  value: midiEvent.id,
                }))}
                size="small"
                value={trigger.midiEventId}
              />

              <InputField
                id={`trigger-measure-${trigger.id}`}
                label="Measure"
                min={1}
                onChange={(event) => {
                  onEditMidiButtonTrigger?.(trigger.id, {
                    beat: trigger.beat,
                    measure: Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                    midiEventId: trigger.midiEventId,
                  });
                }}
                size="small"
                type="number"
                value={trigger.measure}
              />

              <InputField
                id={`trigger-beat-${trigger.id}`}
                label="Beat"
                min={1}
                onChange={(event) => {
                  onEditMidiButtonTrigger?.(trigger.id, {
                    beat: Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                    measure: trigger.measure,
                    midiEventId: trigger.midiEventId,
                  });
                }}
                size="small"
                type="number"
                value={trigger.beat}
              />

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
