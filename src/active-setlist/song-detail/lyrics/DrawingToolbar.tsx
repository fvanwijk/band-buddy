import { IconEraser, IconPointer, IconScribble, IconTrash } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '../../../ui/Button';
import { cn } from '../../../utils/cn';

type ColorOption = {
  label: string;
  value: string;
};

type DrawingMode = 'idle' | 'pen' | 'eraser';

type DrawingToolbarProps = {
  mode: DrawingMode;
  onClear: () => void;
  onColorSelect: (color: string) => void;
  onModeChange: (mode: DrawingMode) => void;
  selectedColor: string;
};

const colorOptions: ColorOption[] = [
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Yellow', value: '#facc15' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#ffffff' },
];

export function DrawingToolbar({
  mode,
  onClear,
  onColorSelect,
  onModeChange,
  selectedColor,
}: DrawingToolbarProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedOption = useMemo(
    () => colorOptions.find((option) => option.value === selectedColor),
    [selectedColor],
  );

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) {
        return;
      }

      if (!dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Drawing tools */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 p-2">
        <Button
          color={mode === 'idle' ? 'primary' : 'default'}
          icon
          onClick={() => onModeChange('idle')}
          title="Cancel"
          variant={mode === 'idle' ? 'filled' : 'outlined'}
        >
          <IconPointer className="h-4 w-4" />
        </Button>
        <Button
          color={mode === 'pen' ? 'primary' : 'default'}
          icon
          onClick={() => onModeChange('pen')}
          title="Pen"
          variant={mode === 'pen' ? 'filled' : 'outlined'}
        >
          <IconScribble className="h-4 w-4" />
        </Button>

        <Button
          color={mode === 'eraser' ? 'primary' : 'default'}
          icon
          onClick={() => onModeChange('eraser')}
          title="Eraser"
          variant={mode === 'eraser' ? 'filled' : 'outlined'}
        >
          <IconEraser className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative" ref={dropdownRef}>
        <Button
          className="p-1!"
          color="default"
          icon
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          title={selectedOption?.label || 'Color'}
          variant="outlined"
        >
          <span
            className="h-6 w-6 rounded-full border border-slate-700"
            style={{ backgroundColor: selectedColor }}
          />
        </Button>
        {isDropdownOpen && (
          <div className="absolute left-0 top-12 z-30 w-48 rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-lg">
            <p className="px-2 pb-2 text-xs uppercase tracking-wide text-slate-400">
              {selectedOption?.label || 'Color'}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((option) => (
                <Button
                  color="default"
                  icon
                  key={option.value}
                  onClick={() => handleColorSelect(option.value)}
                  title={option.label}
                  variant="ghost"
                >
                  <span
                    className={cn(
                      'h-5 w-5 rounded-full border border-slate-700',
                      selectedColor === option.value && 'ring-2 ring-brand-400',
                    )}
                    style={{ backgroundColor: option.value }}
                  />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button color="default" icon onClick={onClear} title="Clear" variant="outlined">
        <IconTrash className="h-4 w-4" />
      </Button>
    </div>
  );
}
