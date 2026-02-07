import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { IconAdjustments, IconMinus, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import { usePopper } from 'react-popper';

import { useUpdateSong } from '../../api/useSong';
import type { Song } from '../../types';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { cn } from '../../utils/cn';

type SettingsPanelProps = {
  onZoomChange: (zoom: number) => void;
  song: Song;
  zoom: number;
};

const formatTranspose = (transpose: number) => (transpose > 0 ? `+${transpose}` : `${transpose}`);

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

  const handleZoomChange = (value: number) => {
    onZoomChange(value);
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
          <div className="mt-4 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">Zoom</p>
              {zoom !== 1 && (
                <Button
                  className="h-6 w-6 p-1! -my-1 text-xs"
                  icon
                  onClick={() => handleZoomChange(1)}
                  title="Reset zoom to 1×"
                  type="button"
                  variant="ghost"
                >
                  <IconRefresh className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="relative flex items-center gap-2">
              <span className="text-xs text-slate-400">0.75×</span>
              <div className="relative flex-1">
                <input
                  type="range"
                  min="0.75"
                  max="2"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <div
                  className="absolute top-1/2 h-2 w-0.5 bg-slate-500 pointer-events-none"
                  style={{
                    left: `${((1 - 0.75) / (2 - 0.75)) * 100}%`,
                    transform: 'translate(calc(-50% + 5px), 8px)',
                  }}
                />
              </div>
              <span className="text-xs text-slate-400">2×</span>
            </div>
            <p className="mt-1 text-center text-xs font-semibold text-brand-200">
              {zoom.toFixed(2)}×
            </p>
          </div>
        </Card>
      </PopoverPanel>
    </Popover>
  );
}
