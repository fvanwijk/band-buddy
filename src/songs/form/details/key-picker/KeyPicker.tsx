import { useId, useRef } from 'react';
import type { FC, KeyboardEvent } from 'react';
import type { FieldError } from 'react-hook-form';

import {
  findSlice,
  formatKey,
  getPolarPoint,
  getSlicePath,
  majorSlices,
  minorSlices,
  type KeyQuality,
  type KeySlice,
} from './keyWheel';

type KeyPickerProps = {
  error?: FieldError;
  label: string;
  note?: string;
  onChange: (note: string, quality: KeyQuality) => void;
  quality?: string;
  required?: boolean;
};

const CENTER = 150;
const RINGS = {
  major: { fontSize: 16, innerRadius: 102, outerRadius: 146 },
  minor: { fontSize: 13, innerRadius: 62, outerRadius: 98 },
};

export const KeyPicker: FC<KeyPickerProps> = ({
  error,
  label,
  note,
  onChange,
  quality,
  required = false,
}) => {
  const labelId = useId();
  const sliceRefs = useRef<Record<string, SVGGElement | null>>({});
  const matchingSlice = findSlice(note, quality);
  // A stored key spelled differently than its slice (e.g. "G#" vs. "A♭") is not selected
  const selected = matchingSlice?.note === note ? matchingSlice : undefined;
  const keyQuality: KeyQuality = quality === 'm' ? 'm' : '';
  const tabStopId = matchingSlice?.id ?? majorSlices[0].id;

  const select = (slice: KeySlice) => {
    if (slice.id !== selected?.id) {
      onChange(slice.note, slice.quality);
    }
    sliceRefs.current[slice.id]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>, slice: KeySlice) => {
    const ring = slice.quality === 'm' ? minorSlices : majorSlices;
    const otherRing = slice.quality === 'm' ? majorSlices : minorSlices;
    const currentIndex = ring.indexOf(slice);

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        if (event.key === 'ArrowDown' && slice.quality === '') {
          select(otherRing.find((item) => item.position === slice.position && item.index === 0)!);
        } else {
          select(ring[(currentIndex + 1) % ring.length]);
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        if (event.key === 'ArrowUp' && slice.quality === 'm') {
          select(otherRing.find((item) => item.position === slice.position && item.index === 0)!);
        } else {
          select(ring[(currentIndex - 1 + ring.length) % ring.length]);
        }
        break;
      case ' ':
      case 'Enter':
        select(slice);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const renderSlice = (slice: KeySlice, ring: keyof typeof RINGS) => {
    const ringConfig = RINGS[ring];
    const isSplit = slice.count > 1;
    const sliceThickness = (ringConfig.outerRadius - ringConfig.innerRadius) / slice.count;
    const outerRadius = ringConfig.outerRadius - slice.index * sliceThickness;
    const innerRadius = outerRadius - sliceThickness;
    const isSelected = slice.id === selected?.id;
    const isEnharmonicMatch = !selected && slice.id === matchingSlice?.id;
    const labelPoint = getPolarPoint(
      CENTER,
      (innerRadius + outerRadius) / 2,
      (slice.startAngle + slice.endAngle) / 2,
    );
    const name = formatKey(slice.note, slice.quality);

    return (
      <g
        aria-checked={isSelected}
        aria-label={`${formatKey(slice.note, '')} ${slice.quality === 'm' ? 'minor' : 'major'}`}
        className="group cursor-pointer outline-none [&:focus-visible>path]:stroke-brand-200 [&:focus-visible>path]:stroke-2"
        data-checked={isSelected}
        data-enharmonic={isEnharmonicMatch}
        key={slice.id}
        onClick={() => select(slice)}
        onKeyDown={(event) => handleKeyDown(event, slice)}
        ref={(element) => {
          sliceRefs.current[slice.id] = element;
        }}
        role="radio"
        tabIndex={slice.id === tabStopId ? 0 : -1}
      >
        <path
          className="fill-slate-800 stroke-slate-900 stroke-1 group-hover:fill-slate-700 group-data-[checked=true]:fill-brand-500 group-data-[enharmonic=true]:fill-brand-900"
          d={getSlicePath(CENTER, innerRadius, outerRadius, slice.startAngle, slice.endAngle)}
        />
        <text
          className="pointer-events-none fill-slate-300 font-semibold select-none group-data-[checked=true]:fill-slate-950"
          dominantBaseline="central"
          fontSize={isSplit ? ringConfig.fontSize - 3 : ringConfig.fontSize}
          textAnchor="middle"
          x={labelPoint.x}
          y={labelPoint.y}
        >
          {name}
        </text>
      </g>
    );
  };

  return (
    <div>
      <div className="mb-2 text-sm font-medium text-slate-300" id={labelId}>
        {label}
        {required && <span className="ml-1 text-brand-400/70">*</span>}
      </div>
      <svg
        aria-labelledby={labelId}
        className="block w-full max-w-xs"
        role="radiogroup"
        viewBox="0 0 300 300"
      >
        {majorSlices.map((slice) => renderSlice(slice, 'major'))}
        {minorSlices.map((slice) => renderSlice(slice, 'minor'))}
        <g aria-hidden className="pointer-events-none select-none" textAnchor="middle">
          {note ? (
            <>
              <text
                className="fill-brand-200 text-4xl font-bold"
                dominantBaseline="central"
                x={CENTER}
                y={CENTER - 8}
              >
                {formatKey(note, keyQuality)}
              </text>
              <text className="fill-slate-400 text-xs" x={CENTER} y={CENTER + 24}>
                {keyQuality === 'm' ? 'minor' : 'major'}
              </text>
            </>
          ) : (
            <>
              <text className="fill-slate-300 text-sm font-medium" x={CENTER} y={CENTER - 8}>
                Pick a key
              </text>
              <text className="fill-slate-500 text-[10px]" x={CENTER} y={CENTER + 10}>
                outer: major
              </text>
              <text className="fill-slate-500 text-[10px]" x={CENTER} y={CENTER + 24}>
                inner: minor
              </text>
            </>
          )}
        </g>
      </svg>
      {error && <p className="mt-1 text-xs text-red-400">{error.message}</p>}
    </div>
  );
};
