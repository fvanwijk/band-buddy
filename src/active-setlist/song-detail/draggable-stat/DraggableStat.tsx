import { useRef, useState } from 'react';
import type { FC, KeyboardEvent, PointerEvent, ReactNode } from 'react';

import { cn } from '../../../utils/cn';

type DraggableStatProps = {
  ariaLabel?: string;
  children?: ReactNode;
  label: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  pixelsPerStep?: number;
  title: string;
  value: number;
};

/**
 * A stat whose numeric value can be changed by dragging it up/down (or with the arrow keys).
 * `onChange` is called for every step, so the new value can be saved immediately.
 */
export const DraggableStat: FC<DraggableStatProps> = ({
  ariaLabel,
  children,
  label,
  max = Infinity,
  min = -Infinity,
  onChange,
  pixelsPerStep = 6,
  title,
  value,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ lastValue: number; startValue: number; startY: number } | null>(null);

  const clamp = (newValue: number) => Math.min(max, Math.max(min, newValue));

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { lastValue: value, startValue: value, startY: event.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }

    const steps = Math.round((drag.startY - event.clientY) / pixelsPerStep);
    const newValue = clamp(drag.startValue + steps);
    if (newValue !== drag.lastValue) {
      drag.lastValue = newValue;
      onChange(newValue);
    }
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();
    const newValue = clamp(value + (event.key === 'ArrowUp' ? 1 : -1));
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  return (
    <div
      aria-label={ariaLabel ?? label}
      aria-valuemax={Number.isFinite(max) ? max : undefined}
      aria-valuemin={Number.isFinite(min) ? min : undefined}
      aria-valuenow={value}
      className="group cursor-ns-resize touch-none select-none"
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      role="spinbutton"
      tabIndex={0}
      title={title}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={cn(
          'font-semibold transition-colors',
          isDragging ? 'text-brand-400' : 'text-slate-100 group-hover:text-brand-300',
        )}
      >
        {children ?? value}
      </p>
    </div>
  );
};
