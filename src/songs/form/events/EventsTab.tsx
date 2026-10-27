import { IconLayoutList, IconPlus, IconTimeline } from '@tabler/icons-react';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import {
  createSongEvent,
  getNewEventPosition,
  moveEventGroup,
  moveSongEvent,
  removeSongEvent,
  updateSongEvent,
} from '../../../song-events/editEvents';
import type { EventPatch, EventPosition } from '../../../song-events/editEvents';
import { groupEventsByPosition } from '../../../song-events/groupEventsByPosition';
import type { SongEventGroup } from '../../../song-events/groupEventsByPosition';
import { validateSongEvents } from '../../../song-events/validateSongEvents';
import type { SongEventIssue } from '../../../song-events/validateSongEvents';
import type { MidiEvent, SongEvent, SongEventType } from '../../../types';
import { Alert } from '../../../ui/Alert';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { Dialog } from '../../../ui/Dialog';
import { timeSignatureOptions } from '../timeSignatureOptions';
import { EventGroupCard } from './EventGroupCard';
import { eventTypeInfo, eventTypes } from './eventTypeInfo';
import { SongTimeline } from './timeline/SongTimeline';

const DEFAULT_BPM = 120;
const DEFAULT_TIME_SIGNATURE = '4/4';

type EventsTabProps = {
  bpm?: number;
  /** Number of measures the song's duration comes down to, when known */
  estimatedMeasures?: number | null;
  events: SongEvent[];
  midiEvents: MidiEvent[];
  onEventsChange: (events: SongEvent[]) => void;
  timeSignature?: string;
};

export const EventsTab: FC<EventsTabProps> = ({
  bpm,
  estimatedMeasures,
  events,
  midiEvents,
  onEventsChange,
  timeSignature,
}) => {
  const [view, setView] = useState<'list' | 'timeline'>('list');
  const [selected, setSelected] = useState<EventPosition | null>(null);

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

  // The group at the selected position, which is empty when nothing happens there yet
  const selectedKey = selected ? `${selected.measure}:${selected.beat}` : null;
  const selectedGroup: SongEventGroup | null = selected
    ? (groups.find(({ key }) => key === selectedKey) ?? {
        beat: selected.beat,
        events: [],
        hasChange: false,
        key: `${selected.measure}:${selected.beat}`,
        measure: selected.measure,
      })
    : null;

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
    if (view === 'timeline') {
      setSelected({ beat: newEvent.beat, measure: newEvent.measure });
    }
  };

  const handleMoveGroup = (from: EventPosition, to: EventPosition) => {
    const hasChange = groups.some(
      (group) => group.hasChange && group.beat === from.beat && group.measure === from.measure,
    );

    onEventsChange(moveEventGroup(events, from, to));
    // The editor follows the group, when it was opened for it
    if (selected) {
      setSelected({ beat: hasChange ? 1 : to.beat, measure: to.measure });
    }
  };

  const handleDropEvent = (eventId: string, to: EventPosition) => {
    onEventsChange(moveSongEvent(events, eventId, to));
  };

  const handleViewChange = (nextView: 'list' | 'timeline') => {
    setView(nextView);
    setSelected(null);
  };

  const getEventLabel = (event: SongEvent) => {
    switch (event.type) {
      case 'cue':
        return event.text || 'Empty cue';
      case 'midiButton':
        return midiEvents.find(({ id }) => id === event.midiEventId)?.label ?? 'Unknown button';
      case 'tempoChange':
        return `${event.bpm} BPM`;
      case 'timeSignatureChange':
        return event.timeSignature;
    }
  };

  const renderGroupCard = (group: SongEventGroup) => (
    <EventGroupCard
      group={group}
      hasMidiEvents={hasMidiEvents}
      issuesByEventId={issuesByEventId}
      key={group.key}
      midiEvents={midiEvents}
      onAdd={handleAdd}
      onDelete={(eventId) => onEventsChange(removeSongEvent(events, eventId))}
      onMove={handleMoveGroup}
      onUpdate={(eventId: string, patch: EventPatch) =>
        onEventsChange(updateSongEvent(events, eventId, patch))
      }
    />
  );

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
        <div aria-label="View" className="ml-auto flex gap-1" role="group">
          <Button
            aria-pressed={view === 'list'}
            color={view === 'list' ? 'primary' : 'default'}
            iconStart={<IconLayoutList className="h-3 w-3" />}
            onClick={() => handleViewChange('list')}
            size="small"
            type="button"
            variant="outlined"
          >
            List
          </Button>
          <Button
            aria-pressed={view === 'timeline'}
            color={view === 'timeline' ? 'primary' : 'default'}
            iconStart={<IconTimeline className="h-3 w-3" />}
            onClick={() => handleViewChange('timeline')}
            size="small"
            type="button"
            variant="outlined"
          >
            Timeline
          </Button>
        </div>
      </div>

      {view === 'timeline' ? (
        <>
          <p className="text-xs text-slate-500">
            Select a beat to add events there, or an event to edit it. Drag an event to another beat
            to move it. The amber bar shows where the count-in before a tempo change is spoken.
          </p>
          <SongTimeline
            bpm={bpm}
            estimatedMeasures={estimatedMeasures}
            events={events}
            getEventLabel={getEventLabel}
            issuesByEventId={issuesByEventId}
            onDropEvent={handleDropEvent}
            onSelect={setSelected}
            selected={selected}
            timeSignature={timeSignature}
          />
          {selectedGroup && (
            <Dialog
              contentClassName="max-w-2xl"
              onClose={() => setSelected(null)}
              open
              title={`Measure ${selectedGroup.measure}, beat ${selectedGroup.beat}`}
            >
              {renderGroupCard(selectedGroup)}
            </Dialog>
          )}
        </>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-center text-sm text-slate-400">
          No events yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">{groups.map(renderGroupCard)}</div>
      )}
    </Card>
  );
};
