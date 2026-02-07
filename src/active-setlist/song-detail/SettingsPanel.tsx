import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { IconAdjustments, IconMinus, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { usePopper } from 'react-popper';

import { useUpdateSong } from '../../api/useSong';
import type { Song } from '../../types';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { cn } from '../../utils/cn';

type SettingsPanelProps = {
  song: Song;
};

const formatTranspose = (transpose: number) => (transpose > 0 ? `+${transpose}` : `${transpose}`);

export function SettingsPanel({ song }: SettingsPanelProps) {
  const updateSong = useUpdateSong(song.id);
  const transpose = song.transpose ?? 0;
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
    placement: 'bottom-end',
  });

  const handleTranspose = (delta: number) => {
    updateSong({
      ...song,
      transpose: transpose + delta,
    });
  };

  return (
    <Popover>
      <PopoverButton
        as={Button}
        color="primary"
        icon
        ref={setReferenceElement}
        title="Settings"
        type="button"
        variant="outlined"
      >
        <IconAdjustments className="h-4 w-4" />
      </PopoverButton>
      <PopoverPanel
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
        className="shadow-lg z-20"
      >
        <Card>
          <p className="pb-2 text-xs uppercase tracking-wide text-slate-400">Transpose</p>
          <div className="flex items-center gap-2">
            <Button
              className="h-7 w-7 text-xs"
              icon
              onClick={() => handleTranspose(-1)}
              title="Transpose down"
              type="button"
              variant="ghost"
            >
              <IconMinus className="h-4 w-4" />
            </Button>
            <span
              className={cn(
                'min-w-8 text-center text-xs',
                transpose !== 0 ? 'text-brand-200 font-semibold' : 'text-slate-400',
              )}
            >
              {formatTranspose(transpose)}
            </span>
            <Button
              className="h-7 w-7 text-xs"
              icon
              onClick={() => handleTranspose(1)}
              title="Transpose up"
              type="button"
              variant="ghost"
            >
              <IconPlus className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </PopoverPanel>
    </Popover>
  );
}
