import { IconPlus } from '@tabler/icons-react';
import type { FC } from 'react';
import { useMemo } from 'react';

import {
  createSongEvent,
  getNewEventPosition,
  moveEventGroup,
  removeSongEvent,
  updateSongEvent,
} from '../../../song-events/editEvents';
import type { EventPatch, EventPosition } from '../../../song-events/editEvents';
import { groupEventsByPosition } from '../../../song-events/groupEventsByPosition';
import { validateSongEvents } from '../../../song-events/validateSongEvents';
import type { SongEventIssue } from '../../../song-events/validateSongEvents';
import type { MidiEvent, SongEvent, SongEventType } from '../../../types';
import { Alert } from '../../../ui/Alert';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { timeSignatureOptions } from '../timeSignatureOptions';
import { EventGroupCard } from './EventGroupCard';
import { eventTypeInfo, eventTypes } from './eventTypeInfo';

const DEFAULT_BPM = 120;
const DEFAULT_TIME_SIGNATURE = '4/4';

type EventsTabProps = {
  bpm?: number;
  events: SongEvent[];
  midiEvents: MidiEvent[];
  onEventsChange: (events: SongEvent[]) => void;
  timeSignature?: string;
};

export const EventsTab: FC<EventsTabProps> = ({
  bpm,
  events,
  midiEvents,
  onEventsChange,
  timeSignature,
}) => {
  const groups = useMemo(() => groupEventsByPosition(events), [events]);
  const issuesByEventId = useMemo(() => {
    const issues = validateSongEvents(events, { bpm: bpm || undefined, timeSignature });
    const byEventId = new Map<string, SongEventIssue[]>();
    for (const issue of issues) {
      byEventId.set(issue.eventId, [...(byEventId.get(issue.eventId) ?? []), issue]);
    }
    return byEventId;
  }, [bpm, events, timeSignature]);

  const hasMidiEvents = midiEvents.length > 0;

  const handleAdd = (type: SongEventType, position?: EventPosition) => {
    const songTimeSignature = timeSignature || DEFAULT_TIME_SIGNATURE;
    const newEvent = createSongEvent(
      type,
      `${type}-${crypto.randomUUID()}`,
      position ?? getNewEventPosition(events, type),
      {
        bpm: bpm || DEFAULT_BPM,
        midiEventId: midiEvents[0]?.id ?? '',
        timeSignature:
          timeSignatureOptions.find(({ value }) => value !== songTimeSignature)?.value ??
          songTimeSignature,
      },
    );

    onEventsChange([...events, newEvent]);
  };

  return (
    <Card>
      <p className="text-xs text-slate-500">
        Events happen at a measure and beat while the metronome is running. Cues and the count-in
        before a tempo change are spoken when the cue/pre count volume is above 0. Cues are always
        spoken in English. A tempo or time signature change always starts on beat 1 of a measure.
      </p>

      {!bpm && (
        <Alert severity="info">
          Set a BPM on the song details tab. The metronome, and with it all events, needs it.
        </Alert>
      )}

      {!hasMidiEvents && (
        <Alert severity="info">
          Create a MIDI button on the MIDI buttons tab to trigger it at a measure and beat.
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <h3 className="mr-2 text-sm font-semibold text-slate-200">Add event</h3>
        {eventTypes.map((type) => (
          <Button
            aria-label={`Add ${eventTypeInfo[type].noun}`}
            color="primary"
            disabled={type === 'midiButton' && !hasMidiEvents}
            iconStart={<IconPlus className="h-3 w-3" />}
            key={type}
            onClick={() => handleAdd(type)}
            size="small"
            type="button"
            variant="outlined"
          >
            {eventTypeInfo[type].label}
          </Button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-center text-sm text-slate-400">
          No events yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <EventGroupCard
              group={group}
              hasMidiEvents={hasMidiEvents}
              issuesByEventId={issuesByEventId}
              key={group.key}
              midiEvents={midiEvents}
              onAdd={handleAdd}
              onDelete={(eventId) => onEventsChange(removeSongEvent(events, eventId))}
              onMove={(from, to) => onEventsChange(moveEventGroup(events, from, to))}
              onUpdate={(eventId: string, patch: EventPatch) =>
                onEventsChange(updateSongEvent(events, eventId, patch))
              }
            />
          ))}
        </div>
      )}
    </Card>
  );
};
