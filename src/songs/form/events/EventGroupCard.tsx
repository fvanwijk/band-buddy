import { IconLock, IconPlus } from '@tabler/icons-react';
import type { FC } from 'react';

import type { EventPatch, EventPosition } from '../../../song-events/editEvents';
import { getEventTypeAvailability } from '../../../song-events/editEvents';
import type { SongEventGroup } from '../../../song-events/groupEventsByPosition';
import type { SongEventIssue } from '../../../song-events/validateSongEvents';
import type { MidiEvent, SongEvent, SongEventType } from '../../../types';
import { Button } from '../../../ui/Button';
import { InputField } from '../../../ui/form/InputField';
import { CueFields } from './CueFields';
import { EventRow } from './EventRow';
import { eventTypeInfo, eventTypes } from './eventTypeInfo';
import { MidiButtonFields } from './MidiButtonFields';
import { applyOnEnter, readClampedInteger } from './numberInput';
import { TempoFields } from './TempoFields';
import { TimeSignatureFields } from './TimeSignatureFields';

const MAX_BEAT = 16;
const MAX_MEASURE = 9999;

type EventGroupCardProps = {
  group: SongEventGroup;
  hasMidiEvents: boolean;
  issuesByEventId: Map<string, SongEventIssue[]>;
  midiEvents: MidiEvent[];
  onAdd: (type: SongEventType, position: EventPosition) => void;
  onDelete: (eventId: string) => void;
  onMove: (from: EventPosition, to: EventPosition) => void;
  onUpdate: (eventId: string, patch: EventPatch) => void;
};

export const EventGroupCard: FC<EventGroupCardProps> = ({
  group,
  hasMidiEvents,
  issuesByEventId,
  midiEvents,
  onAdd,
  onDelete,
  onMove,
  onUpdate,
}) => {
  const { beat, key, measure } = group;
  const position = { beat, measure };
  const availability = getEventTypeAvailability(position, group.events);

  const renderFields = (event: SongEvent) => {
    const onChange = (patch: EventPatch) => onUpdate(event.id, patch);

    switch (event.type) {
      case 'cue':
        return <CueFields event={event} onChange={onChange} />;
      case 'midiButton':
        return <MidiButtonFields event={event} midiEvents={midiEvents} onChange={onChange} />;
      case 'tempoChange':
        return <TempoFields event={event} onChange={onChange} />;
      case 'timeSignatureChange':
        return <TimeSignatureFields event={event} onChange={onChange} />;
    }
  };

  return (
    <section
      aria-label={`Measure ${measure}, beat ${beat}`}
      className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-28">
          <InputField
            defaultValue={measure}
            id={`events-${key}-measure`}
            label="Measure"
            max={MAX_MEASURE}
            min={1}
            onBlur={(blurEvent) => {
              const nextMeasure = readClampedInteger(blurEvent, {
                fallback: measure,
                max: MAX_MEASURE,
                min: 1,
              });
              if (nextMeasure !== measure) {
                onMove(position, { beat, measure: nextMeasure });
              }
            }}
            onKeyDown={applyOnEnter}
            size="small"
            type="number"
          />
        </div>
        <div className="w-28">
          <InputField
            defaultValue={beat}
            disabled={group.hasChange}
            id={`events-${key}-beat`}
            label="Beat"
            max={MAX_BEAT}
            min={1}
            onBlur={(blurEvent) => {
              const nextBeat = readClampedInteger(blurEvent, {
                fallback: beat,
                max: MAX_BEAT,
                min: 1,
              });
              if (nextBeat !== beat) {
                onMove(position, { beat: nextBeat, measure });
              }
            }}
            onKeyDown={applyOnEnter}
            size="small"
            type="number"
          />
        </div>
        {group.hasChange && (
          <p className="flex items-center gap-1 self-end pb-1.5 text-xs text-slate-400">
            <IconLock className="h-3 w-3" />
            Changes are always on beat 1
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {group.events.map((event) => (
          <EventRow
            icon={eventTypeInfo[event.type].icon}
            issues={issuesByEventId.get(event.id)}
            key={event.id}
            label={eventTypeInfo[event.type].label}
            noun={eventTypeInfo[event.type].noun}
            onDelete={() => onDelete(event.id)}
          >
            {renderFields(event)}
          </EventRow>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {eventTypes.map((type) => {
          const { label, noun } = eventTypeInfo[type];
          const { isAvailable, reason } = availability[type];
          const isMissingMidiButton = type === 'midiButton' && !hasMidiEvents;

          return (
            <Button
              aria-label={`Add ${noun} to measure ${measure}, beat ${beat}`}
              disabled={!isAvailable || isMissingMidiButton}
              iconStart={<IconPlus className="h-3 w-3" />}
              key={type}
              onClick={() => onAdd(type, position)}
              size="small"
              title={isMissingMidiButton ? 'Create a MIDI button first' : reason}
              type="button"
              variant="outlined"
            >
              {label}
            </Button>
          );
        })}
      </div>
    </section>
  );
};
