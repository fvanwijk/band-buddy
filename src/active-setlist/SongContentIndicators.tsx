import {
  IconBinary,
  IconFileMusic,
  IconMicrophone2,
  IconNotes,
  IconTimeline,
} from '@tabler/icons-react';
import type { FC, ReactNode } from 'react';

import type { Song } from '../types';
import { cn } from '../utils/cn';

type SongContentIndicatorsProps = {
  song: Song;
};

type Indicator = {
  icon: ReactNode;
  isPresent: boolean;
  label: string;
};

export const SongContentIndicators: FC<SongContentIndicatorsProps> = ({ song }) => {
  const indicators: Indicator[] = [
    {
      icon: <IconMicrophone2 className="h-4 w-4" />,
      isPresent: !!song.lyrics?.trim(),
      label: 'lyrics',
    },
    {
      icon: <IconFileMusic className="h-4 w-4" />,
      isPresent: !!song.sheetMusicFilename,
      label: 'sheet music',
    },
    {
      icon: <IconNotes className="h-4 w-4" />,
      isPresent: !!song.notes?.trim(),
      label: 'text notes',
    },
    {
      icon: <IconBinary className="h-4 w-4" />,
      isPresent: !!song.midiEvents?.length,
      label: 'MIDI buttons',
    },
    {
      icon: <IconTimeline className="h-4 w-4" />,
      isPresent: !!song.events?.length,
      label: 'events',
    },
  ];

  return (
    <span className="flex items-center gap-2" data-testid="song-content-indicators">
      {indicators.map(({ icon, isPresent, label }) => (
        <span
          aria-label={isPresent ? `Has ${label}` : `No ${label}`}
          className={cn(isPresent ? 'text-brand-300' : 'text-slate-700')}
          key={label}
          role="img"
          title={isPresent ? `Has ${label}` : `No ${label}`}
        >
          {icon}
        </span>
      ))}
    </span>
  );
};
