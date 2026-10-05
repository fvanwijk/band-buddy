import * as Slider from '@radix-ui/react-slider';

import { cn } from '../utils/cn';

type RangeSliderProps = {
  className?: string;
  max: number;
  maxThumbLabel: string;
  min: number;
  minThumbLabel: string;
  onValueChange: (value: [number, number]) => void;
  step?: number;
  value: [number, number];
};

export function RangeSlider({
  className,
  max,
  maxThumbLabel,
  min,
  minThumbLabel,
  onValueChange,
  step = 1,
  value,
}: RangeSliderProps) {
  const thumbClass =
    'block h-5 w-5 rounded-full bg-slate-200 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400';

  return (
    <Slider.Root
      className={cn('relative flex h-5 w-full touch-none items-center select-none', className)}
      max={max}
      min={min}
      onValueChange={(next) => onValueChange([next[0], next[1]])}
      step={step}
      value={value}
    >
      <Slider.Track className="relative h-1.5 grow rounded-full bg-slate-800">
        <Slider.Range className="absolute h-full rounded-full bg-brand-400" />
      </Slider.Track>
      <Slider.Thumb aria-label={minThumbLabel} className={thumbClass} />
      <Slider.Thumb aria-label={maxThumbLabel} className={thumbClass} />
    </Slider.Root>
  );
}
