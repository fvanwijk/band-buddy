import * as Tooltip from '@radix-ui/react-tooltip';
import type { FC } from 'react';

import { cn } from '../../../../utils/cn';

export type MidiInstrumentIndicatorProps = {
  isOnline: boolean;
  name: string;
};

export const MidiInstrumentIndicator: FC<MidiInstrumentIndicatorProps> = ({ isOnline, name }) => {
  const status = isOnline ? 'online' : 'offline';

  return (
    <Tooltip.Provider delayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span
            aria-label={`${name} (${status})`}
            className="flex h-4 w-4 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            tabIndex={0}
          >
            <span
              className={cn('h-2.5 w-2.5 rounded-full', isOnline ? 'bg-green-500' : 'bg-red-500')}
            />
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 rounded bg-slate-400 px-2 py-1 text-xs font-normal tracking-normal text-slate-900 normal-case shadow-lg"
            side="bottom"
            sideOffset={4}
          >
            {name} ({status})
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
