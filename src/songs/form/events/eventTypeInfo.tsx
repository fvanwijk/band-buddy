import { IconGauge, IconMessage, IconMetronome, IconPiano } from '@tabler/icons-react';
import type { ReactNode } from 'react';

import type { SongEventType } from '../../../types';

export const eventTypeInfo: Record<
  SongEventType,
  { icon: ReactNode; label: string; noun: string }
> = {
  cue: { icon: <IconMessage className="h-4 w-4" />, label: 'Cue', noun: 'cue' },
  midiButton: {
    icon: <IconPiano className="h-4 w-4" />,
    label: 'MIDI button',
    noun: 'MIDI button',
  },
  tempoChange: {
    icon: <IconGauge className="h-4 w-4" />,
    label: 'Tempo change',
    noun: 'tempo change',
  },
  timeSignatureChange: {
    icon: <IconMetronome className="h-4 w-4" />,
    label: 'Time signature change',
    noun: 'time signature change',
  },
};

// The order buttons to add events are shown in
export const eventTypes: SongEventType[] = [
  'cue',
  'midiButton',
  'tempoChange',
  'timeSignatureChange',
];

// Colors of the types in the timeline, as classes for a chip and for the dot in a beat
export const eventTypeColors: Record<SongEventType, { chip: string; dot: string }> = {
  cue: { chip: 'border-sky-400/40 bg-sky-400/10 text-sky-200', dot: 'bg-sky-400' },
  midiButton: {
    chip: 'border-violet-400/40 bg-violet-400/10 text-violet-200',
    dot: 'bg-violet-400',
  },
  tempoChange: { chip: 'border-amber-400/40 bg-amber-400/10 text-amber-200', dot: 'bg-amber-400' },
  timeSignatureChange: {
    chip: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
    dot: 'bg-emerald-400',
  },
};
