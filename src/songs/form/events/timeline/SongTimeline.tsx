import { IconPlus } from '@tabler/icons-react';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import type { EventPosition } from '../../../../song-events/editEvents';
import { compareSongEvents } from '../../../../song-events/groupEventsByPosition';
import { buildSongMap, findSegmentByMeasure } from '../../../../song-events/songMap';
import {
  getCountInBars,
  getTimelineMeasureCount,
  MEASURES_PER_ROW,
} from '../../../../song-events/timelineLayout';
import type { SongEventIssue } from '../../../../song-events/validateSongEvents';
import type { SongEvent } from '../../../../types';
import { Button } from '../../../../ui/Button';
import { TimelineMeasure } from './TimelineMeasure';

type SongTimelineProps = {
  bpm?: number;
  estimatedMeasures?: number | null;
  events: SongEvent[];
  getEventLabel: (event: SongEvent) => string;
  issuesByEventId: Map<string, SongEventIssue[]>;
  onDropEvent: (eventId: string, position: EventPosition) => void;
  onSelect: (position: EventPosition) => void;
  selected: EventPosition | null;
  timeSignature?: string;
};

export const SongTimeline: FC<SongTimelineProps> = ({
  bpm,
  estimatedMeasures,
  events,
  getEventLabel,
  issuesByEventId,
  onDropEvent,
  onSelect,
  selected,
  timeSignature,
}) => {
  const [extraRows, setExtraRows] = useState(0);
  const [dragging, setDragging] = useState<SongEvent | null>(null);

  // Without a tempo the structure is the same, only the count-ins can't be placed
  const map = useMemo(
    () => buildSongMap({ bpm: bpm || 120, events, timeSignature }),
    [bpm, events, timeSignature],
  );
  const countInBars = useMemo(() => (bpm ? getCountInBars(map) : []), [bpm, map]);
  const eventsByMeasure = useMemo(() => {
    const byMeasure = new Map<number, SongEvent[]>();
    for (const event of events.toSorted(compareSongEvents)) {
      byMeasure.set(event.measure, [...(byMeasure.get(event.measure) ?? []), event]);
    }
    return byMeasure;
  }, [events]);

  const measureCount = getTimelineMeasureCount({ estimatedMeasures, events, extraRows });
  const ownTempo = [bpm ? `${bpm} BPM` : undefined, timeSignature || '4/4']
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: measureCount / MEASURES_PER_ROW }, (_, row) => (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" key={row}>
          {Array.from({ length: MEASURES_PER_ROW }, (_, index) => {
            const measure = row * MEASURES_PER_ROW + index + 1;

            return (
              <TimelineMeasure
                beatsPerMeasure={findSegmentByMeasure(map, measure).beatsPerMeasure}
                countInBars={countInBars.filter((bar) => bar.measure === measure)}
                dragging={dragging}
                events={eventsByMeasure.get(measure) ?? []}
                getEventLabel={getEventLabel}
                issuesByEventId={issuesByEventId}
                key={measure}
                measure={measure}
                onDragEnd={() => setDragging(null)}
                onDragStart={setDragging}
                onDropEvent={(eventId, position) => {
                  // A moved chip can be gone from the page before its dragend arrives
                  setDragging(null);
                  onDropEvent(eventId, position);
                }}
                onSelect={onSelect}
                ownTempo={measure === 1 ? ownTempo : undefined}
                selected={selected}
              />
            );
          })}
        </div>
      ))}

      <Button
        className="self-start"
        iconStart={<IconPlus className="h-3 w-3" />}
        onClick={() => setExtraRows((rows) => rows + 1)}
        size="small"
        type="button"
        variant="outlined"
      >
        More measures
      </Button>
    </div>
  );
};
