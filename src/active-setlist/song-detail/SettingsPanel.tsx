import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { IconAdjustments } from '@tabler/icons-react';
import { useState } from 'react';
import { usePopper } from 'react-popper';

import { TransposePanel } from './TransposePanel';
import { ZoomPanel } from './ZoomPanel';
import { useUpdateSong } from '../../api/useSong';
import type { Song } from '../../types';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

type SettingsPanelProps = {
  onZoomChange: (zoom: number) => void;
  song: Song;
  zoom: number;
};

export function SettingsPanel({ onZoomChange, song, zoom }: SettingsPanelProps) {
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
          <TransposePanel onTransposeChange={handleTranspose} transpose={transpose} />
          <div className="my-4 h-px bg-slate-800" />
          <ZoomPanel onZoomChange={onZoomChange} zoom={zoom} />
        </Card>
      </PopoverPanel>
    </Popover>
  );
}
