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
