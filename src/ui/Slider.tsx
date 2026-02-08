import type { ChangeEventHandler, ReactNode } from 'react';

import { cn } from '../utils/cn';

type SliderProps = {
  ariaLabel: string;
  className?: string;
  defaultValue?: number;
  max: number | string;
  maxLabel?: ReactNode;
  min: number | string;
  minLabel?: ReactNode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  step?: number | string;
  value: number | string;
};

export function Slider({
  ariaLabel,
  className,
  defaultValue,
  max,
  maxLabel,
  min,
  minLabel,
  onChange,
  step,
  value,
}: SliderProps) {
  const minNum = typeof min === 'string' ? parseFloat(min) : min;
  const maxNum = typeof max === 'string' ? parseFloat(max) : max;
  const markerPosition =
    defaultValue !== undefined ? ((defaultValue - minNum) / (maxNum - minNum)) * 100 : null;

  return (
    <div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
      <div className="relative">
        <input
          aria-label={ariaLabel}
          className={cn(
            'h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-slate-200',
            className,
          )}
          max={max}
          min={min}
          onChange={onChange}
          step={step}
          type="range"
          value={value}
        />
        {markerPosition !== null && (
          <div
            className="pointer-events-none absolute top-1/2 h-1.5 w-0.5 bg-slate-500"
            style={{
              left: `${markerPosition}%`,
              transform: 'translate(calc(-50% + 5px), 15px)',
            }}
          />
        )}
      </div>
    </div>
  );
}
