import type { FC } from 'react';
import { useState } from 'react';

import type { EventPosition } from '../../../../song-events/editEvents';
import { isChangeEvent } from '../../../../song-events/groupEventsByPosition';
import type { CountInBar } from '../../../../song-events/timelineLayout';
import type { SongEventIssue } from '../../../../song-events/validateSongEvents';
import type { SongEvent } from '../../../../types';
import { cn } from '../../../../utils/cn';
import { eventTypeColors } from '../eventTypeInfo';
import { TimelineChip } from './TimelineChip';

type TimelineMeasureProps = {
  beatsPerMeasure: number;
  countInBars: CountInBar[];
  /** The event that is being dragged, if any */
  dragging: SongEvent | null;
  /** The events in this measure, in playback order */
  events: SongEvent[];
  getEventLabel: (event: SongEvent) => string;
  issuesByEventId: Map<string, SongEventIssue[]>;
  measure: number;
  onDragEnd: () => void;
  onDragStart: (event: SongEvent) => void;
  onDropEvent: (eventId: string, position: EventPosition) => void;
  onSelect: (position: EventPosition) => void;
  /** The song's own tempo and time signature, shown on the first measure */
  ownTempo?: string;
  selected: EventPosition | null;
};

export const TimelineMeasure: FC<TimelineMeasureProps> = ({
  beatsPerMeasure,
  countInBars,
  dragging,
  events,
  getEventLabel,
  issuesByEventId,
  measure,
  onDragEnd,
  onDragStart,
  onDropEvent,
  onSelect,
  ownTempo,
  selected,
}) => {
  // What the dragged event is hovering over: the whole measure or one of its beats
  const [over, setOver] = useState<'measure' | number | null>(null);

  // A change is dropped on a measure, which is its position because it is always on beat 1.
  // Other events are dropped on a beat. The first measure has no changes.
  const isMeasureZone = !!dragging && isChangeEvent(dragging) && measure > 1;
  const isBeatZone = !!dragging && !isChangeEvent(dragging);
  const isMeasureOver = isMeasureZone && over === 'measure';

  const isSelected = (beat: number) => selected?.measure === measure && selected.beat === beat;
  const getSeverity = (event: SongEvent) => {
    const issues = issuesByEventId.get(event.id) ?? [];
    return issues.some((issue) => issue.severity === 'error')
      ? 'error'
      : issues.length > 0
        ? 'warning'
        : undefined;
  };
  const renderChip = (event: SongEvent) => (
    <TimelineChip
      event={event}
      isSelected={isSelected(event.beat)}
      key={event.id}
      label={getEventLabel(event)}
      onDragEnd={onDragEnd}
      onDragStart={() => onDragStart(event)}
      onSelect={() => onSelect({ beat: event.beat, measure })}
      severity={getSeverity(event)}
    />
  );

  return (
    <div
      aria-label={`Measure ${measure}`}
      className={cn(
        'flex min-w-0 flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-900/40 p-2',
        isMeasureZone && 'border-dashed border-brand-400/70',
        isMeasureOver && 'border-solid border-brand-400 bg-brand-400/15',
      )}
      data-drop-over={isMeasureOver || undefined}
      data-drop-zone={isMeasureZone || undefined}
      onDragLeave={(dragEvent) => {
        // Moving between the elements inside the measure isn't leaving it
        if (!dragEvent.currentTarget.contains(dragEvent.relatedTarget as Node | null)) {
          setOver(null);
        }
      }}
      onDragOver={(dragEvent) => {
        if (isMeasureZone) {
          dragEvent.preventDefault();
          setOver('measure');
        }
      }}
      onDrop={(dragEvent) => {
        // Drops on a beat bubble up to here, those are only for changes
        if (isMeasureZone) {
          dragEvent.preventDefault();
          onDropEvent(dragging.id, { beat: 1, measure });
        }
        setOver(null);
      }}
      role="group"
    >
      <div className="flex min-h-7 flex-wrap items-center gap-1">
        <span className="mr-1 text-xs font-semibold text-slate-300">{measure}</span>
        {ownTempo && <span className="text-xs text-slate-500">{ownTempo}</span>}
        {events.filter(isChangeEvent).map(renderChip)}
      </div>

      <div className="flex gap-0.5">
        {Array.from({ length: beatsPerMeasure }, (_, index) => index + 1).map((beat) => (
          <button
            aria-label={`Select measure ${measure}, beat ${beat}`}
            aria-pressed={isSelected(beat)}
            className={cn(
              // The contents don't take part in dragging, so hovering them doesn't count as leaving
              'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded border border-slate-700 bg-slate-950/40 py-1 text-[10px] text-slate-400 hover:border-brand-400 [&>*]:pointer-events-none',
              beat === 1 && 'border-slate-500',
              isSelected(beat) && 'border-brand-400 bg-brand-400/20 text-brand-100',
              isBeatZone && 'border-dashed border-brand-400/70',
              isBeatZone && over === beat && 'border-solid border-brand-400 bg-brand-400/30',
            )}
            data-drop-over={(isBeatZone && over === beat) || undefined}
            data-drop-zone={isBeatZone || undefined}
            key={beat}
            onClick={() => onSelect({ beat, measure })}
            onDragLeave={() => setOver((current) => (current === beat ? null : current))}
            onDragOver={(dragEvent) => {
              if (isBeatZone) {
                dragEvent.preventDefault();
                setOver(beat);
              }
            }}
            onDrop={(dragEvent) => {
              if (isBeatZone) {
                dragEvent.preventDefault();
                onDropEvent(dragging.id, { beat, measure });
              }
              setOver(null);
            }}
            type="button"
          >
            {beat}
            <span className="flex h-1 gap-0.5">
              {events
                .filter((event) => event.beat === beat)
                .map((event) => (
                  <span
                    className={cn('h-1 w-1 rounded-full', eventTypeColors[event.type].dot)}
                    key={event.id}
                  />
                ))}
            </span>
          </button>
        ))}
      </div>

      <div className="relative h-1.5 rounded bg-slate-800/60">
        {countInBars.map(({ bpm, left, width }) => (
          <div
            aria-label={`Count-in at ${bpm} BPM`}
            className="absolute inset-y-0 rounded bg-amber-400/50"
            key={`${bpm}-${left}`}
            role="img"
            style={{ left: `${left * 100}%`, width: `${width * 100}%` }}
            title={`Count-in at ${bpm} BPM`}
          />
        ))}
      </div>

      <div className="flex min-h-5 flex-col items-start gap-1">
        {events.filter((event) => !isChangeEvent(event)).map(renderChip)}
      </div>
    </div>
  );
};
