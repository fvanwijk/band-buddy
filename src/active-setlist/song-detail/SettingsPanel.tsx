import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { IconAdjustments } from '@tabler/icons-react';
import { useState } from 'react';
import { usePopper } from 'react-popper';

import { MetronomeVolumePanel } from './MetronomeVolumePanel';
import { TransposePanel } from './TransposePanel';
import { ZoomPanel } from './ZoomPanel';
import { useGetShowDrawingTools, useSetShowDrawingTools } from '../../api/useSettings';
import { useUpdateSong } from '../../api/useSong';
import type { Song } from '../../types';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Checkbox } from '../../ui/Checkbox';

type SettingsPanelProps = {
  onZoomChange: (zoom: number) => void;
  song: Song;
  zoom: number;
};

export function SettingsPanel({ onZoomChange, song, zoom }: SettingsPanelProps) {
  const updateSong = useUpdateSong(song.id);
  const showDrawingTools = useGetShowDrawingTools();
  const setShowDrawingTools = useSetShowDrawingTools();
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
        className="z-20 shadow-lg"
      >
        <Card className="p-1" contentClassName="w-56 space-y-1">
          <TransposePanel onTransposeChange={handleTranspose} transpose={transpose} />
          <MetronomeVolumePanel />
          {song.lyrics && <ZoomPanel onZoomChange={onZoomChange} zoom={zoom} />}
          <div className="space-y-3 bg-slate-800/20 p-3">
            <Checkbox
              checked={showDrawingTools}
              label="Show drawing tools"
              onChange={(e) => setShowDrawingTools(e.target.checked)}
            />
          </div>
        </Card>
      </PopoverPanel>
    </Popover>
  );
}
