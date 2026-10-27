import type { FC } from 'react';

import type { SongEvent } from '../../../../types';
import { cn } from '../../../../utils/cn';
import { eventTypeColors, eventTypeInfo } from '../eventTypeInfo';

type TimelineChipProps = {
  event: SongEvent;
  isSelected: boolean;
  label: string;
  onDragEnd: () => void;
  onDragStart: () => void;
  onSelect: () => void;
  severity?: 'error' | 'warning';
};

export const TimelineChip: FC<TimelineChipProps> = ({
  event,
  isSelected,
  label,
  onDragEnd,
  onDragStart,
  onSelect,
  severity,
}) => (
  <button
    className={cn(
      'flex max-w-full cursor-grab items-center gap-1 rounded-md border px-1.5 py-0.5 text-left text-xs',
      eventTypeColors[event.type].chip,
      severity === 'warning' && 'border-amber-300',
      severity === 'error' && 'border-red-400 bg-red-500/10',
      isSelected && 'ring-2 ring-brand-400',
    )}
    draggable
    onClick={onSelect}
    onDragEnd={onDragEnd}
    onDragStart={(dragEvent) => {
      // Browsers only start a drag when there is data, the dragged event itself is kept in state
      dragEvent.dataTransfer.setData('text/plain', event.id);
      dragEvent.dataTransfer.effectAllowed = 'move';
      onDragStart();
    }}
    title={`${eventTypeInfo[event.type].label} at measure ${event.measure}, beat ${event.beat}. Drag to move it.`}
    type="button"
  >
    {eventTypeInfo[event.type].icon}
    <span className="truncate">
      {event.type === 'cue' || event.type === 'midiButton' ? `${event.beat} · ${label}` : label}
    </span>
  </button>
);
