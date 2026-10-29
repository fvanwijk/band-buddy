import { IconBinary } from '@tabler/icons-react';

import type { MidiEvent } from '../../../types';
import { Alert } from '../../../ui/Alert';
import { Button } from '../../../ui/Button';
import { EmptyStateBlock } from '../../../ui/empty-state-block/EmptyStateBlock';
import { cn } from '../../../utils/cn';
import { useMidiButtonFadeOut } from './useMidiButtonFadeOut';

export type MidiButtonsDisplayProps = {
  highlightedMidiEventId?: string | null;
  isDisabled?: (event: MidiEvent) => boolean;
  midiEvents?: MidiEvent[];
  onTriggerEvent?: (event: MidiEvent) => void;
};

export function MidiButtonsDisplay({
  highlightedMidiEventId,
  isDisabled,
  midiEvents,
  onTriggerEvent,
}: MidiButtonsDisplayProps) {
  const getFadeOutStyle = useMidiButtonFadeOut(highlightedMidiEventId);

  if (!midiEvents || midiEvents.length === 0) {
    return (
      <EmptyStateBlock icon={<IconBinary className="h-8 w-8" />}>
        No MIDI buttons configured yet.
      </EmptyStateBlock>
    );
  }

  const hasDisabled = !!isDisabled && midiEvents.some((event) => isDisabled(event));

  return (
    <div className="space-y-4">
      {hasDisabled && (
        <Alert severity="warning">
          Some MIDI buttons are disabled because their MIDI device is not available.
        </Alert>
      )}
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {midiEvents.map((event) => (
          <Button
            key={event.id}
            className={cn(
              'h-24 rounded-lg text-xl! transition-all',
              highlightedMidiEventId === event.id &&
                'border-brand-300! bg-brand-400/30! ring-2 ring-brand-300/80',
            )}
            color="primary"
            disabled={isDisabled?.(event)}
            onClick={() => onTriggerEvent?.(event)}
            style={getFadeOutStyle(event.id)}
            variant="outlined"
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
