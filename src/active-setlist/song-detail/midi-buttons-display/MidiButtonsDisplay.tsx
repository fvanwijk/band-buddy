import { IconBinary } from '@tabler/icons-react';

import type { Instrument, MidiEvent } from '../../../types';
import { Alert } from '../../../ui/Alert';
import { Button } from '../../../ui/Button';
import { EmptyStateBlock } from '../../../ui/empty-state-block/EmptyStateBlock';
import { cn } from '../../../utils/cn';
import { MidiInstrumentIndicator } from './midi-instrument-indicator/MidiInstrumentIndicator';
import { useMidiButtonFadeOut } from './useMidiButtonFadeOut';

export type MidiButtonsDisplayProps = {
  highlightedMidiEventId?: string | null;
  instruments?: Instrument[];
  isDisabled?: (event: MidiEvent) => boolean;
  isInstrumentOnline?: (instrumentId: string) => boolean;
  midiEvents?: MidiEvent[];
  onTriggerEvent?: (event: MidiEvent) => void;
};

export function MidiButtonsDisplay({
  highlightedMidiEventId,
  instruments,
  isDisabled,
  isInstrumentOnline,
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
        {midiEvents.map((event) => {
          const instrumentIds = [...new Set(event.events.map((action) => action.instrumentId))];

          return (
            <div key={event.id} className="relative">
              <Button
                className={cn(
                  'h-24 w-full rounded-lg text-xl! transition-all',
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
              {/* Rendered outside the button so tooltips still work when the button is disabled */}
              {isInstrumentOnline && instrumentIds.length > 0 && (
                <div className="absolute top-2 left-2 flex gap-1">
                  {instrumentIds.map((instrumentId) => (
                    <MidiInstrumentIndicator
                      key={instrumentId}
                      isOnline={isInstrumentOnline(instrumentId)}
                      name={
                        instruments?.find((instrument) => instrument.id === instrumentId)?.name ??
                        'Unknown instrument'
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Click buttons to send MIDI program change events to the selected instrument.
      </p>
    </div>
  );
}
