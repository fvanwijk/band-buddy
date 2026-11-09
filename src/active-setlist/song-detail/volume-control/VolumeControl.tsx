import * as Slider from '@radix-ui/react-slider';
import { IconVolume, IconVolume2, IconVolume3 } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import type { FC, FocusEvent } from 'react';

import { useLongPress } from '../../../hooks/useLongPress';
import { Button } from '../../../ui/Button';

type VolumeControlProps = {
  label: string;
  // Called continuously while the slider moves
  onChange: (volume: number) => void;
  // Called once the user is done changing the volume
  onCommit?: (volume: number) => void;
  // Volume from 0 to 100
  volume: number;
};

const VolumeIcon: FC<{ volume: number }> = ({ volume }) => {
  if (volume <= 0) {
    return <IconVolume3 className="h-4 w-4" />;
  }

  return volume < 50 ? <IconVolume2 className="h-4 w-4" /> : <IconVolume className="h-4 w-4" />;
};

export const VolumeControl: FC<VolumeControlProps> = ({ label, onChange, onCommit, volume }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerTypeRef = useRef<string | null>(null);
  const volumeBeforeMuteRef = useRef(100);

  // Touch has no hover, so the slider is closed by tapping anywhere outside of it
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  };

  const toggleMute = () => {
    let nextVolume = volumeBeforeMuteRef.current || 100;
    if (volume > 0) {
      volumeBeforeMuteRef.current = volume;
      nextVolume = 0;
    }

    onChange(nextVolume);
    onCommit?.(nextVolume);
  };

  // A mouse can click to mute, so a long press is only for touch devices
  const { consumeLongPress, handlers: longPressHandlers } = useLongPress({
    onLongPress: () => {
      if (pointerTypeRef.current === 'touch') {
        toggleMute();
      }
    },
  });

  const handleClick = () => {
    const isTouch = pointerTypeRef.current === 'touch';
    pointerTypeRef.current = null;

    // The click that ends a long press has already toggled the mute
    if (consumeLongPress() && isTouch) {
      return;
    }

    // A tap on a touch device only opens the slider, so a small volume change doesn't start with a mute
    if (isTouch) {
      setIsOpen((current) => !current);
      return;
    }

    toggleMute();
  };

  return (
    <div
      className="relative"
      onBlur={handleBlur}
      onFocus={() => {
        if (pointerTypeRef.current !== 'touch') {
          setIsOpen(true);
        }
      }}
      onKeyDown={() => {
        pointerTypeRef.current = null;
      }}
      onPointerDown={(event) => {
        pointerTypeRef.current = event.pointerType;
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          setIsOpen(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') {
          setIsOpen(false);
        }
      }}
      ref={containerRef}
    >
      <Button
        color="primary"
        isIcon
        onClick={handleClick}
        title={volume > 0 ? `Mute ${label}` : `Unmute ${label}`}
        type="button"
        variant="outlined"
        {...longPressHandlers}
      >
        <VolumeIcon volume={volume} />
      </Button>
      {isOpen && (
        // The padding bridges the gap to the button, so the slider stays open while moving the mouse to it
        <div className="absolute bottom-full left-1/2 z-20 -translate-x-1/2 pb-2">
          <div className="flex h-32 w-9 justify-center rounded-lg border border-slate-700 bg-slate-900 py-3 shadow-lg">
            <Slider.Root
              className="relative flex h-full w-5 touch-none items-center justify-center select-none"
              max={100}
              min={0}
              onValueChange={([value]) => onChange(value)}
              onValueCommit={([value]) => onCommit?.(value)}
              orientation="vertical"
              step={1}
              value={[volume]}
            >
              <Slider.Track className="relative h-full w-1.5 grow rounded-full bg-slate-800">
                <Slider.Range className="absolute w-full rounded-full bg-brand-400" />
              </Slider.Track>
              <Slider.Thumb
                aria-label={`${label} volume`}
                className="block h-4 w-4 rounded-full bg-slate-200 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              />
            </Slider.Root>
          </div>
        </div>
      )}
    </div>
  );
};
