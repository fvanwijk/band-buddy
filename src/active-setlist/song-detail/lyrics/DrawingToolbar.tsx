import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { IconEraser, IconPointer, IconScribble, IconTrash } from '@tabler/icons-react';
import { useMemo } from 'react';

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

export const colorOptions: ColorOption[] = [
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
  const selectedOption = useMemo(
    () => colorOptions.find((option) => option.value === selectedColor),
    [selectedColor],
  );

  return (
    // 52px + 2rem negative margin
    <div className="sticky top-14 z-10 flex items-center gap-2 mb-2 sm:mb-8 sm:-mt-21 pr-2 self-end">
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

      <Menu as="div" className="relative">
        <MenuButton
          as={Button}
          className="p-1!"
          color="default"
          icon
          title={selectedOption?.label || 'Color'}
          variant="outlined"
        >
          <span
            className="h-6 w-6 rounded-full border border-slate-700"
            style={{ backgroundColor: selectedColor }}
          />
        </MenuButton>
        <MenuItems className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-lg">
          <p className="px-2 pb-2 text-xs uppercase tracking-wide text-slate-400">
            {selectedOption?.label || 'Color'}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((option) => (
              <div>
                <MenuItem key={option.value}>
                  {({ focus }) => (
                    <button
                      className={cn('rounded-full p-2 transition-colors', focus && 'bg-slate-800')}
                      onClick={() => onColorSelect(option.value)}
                      title={option.label}
                      type="button"
                    >
                      <span
                        className={cn(
                          'block h-5 w-5 rounded-full border transition-all',
                          selectedColor === option.value
                            ? 'border-brand-400 ring-2 ring-brand-400'
                            : 'border-slate-700',
                        )}
                        style={{ backgroundColor: option.value }}
                      />
                    </button>
                  )}
                </MenuItem>
              </div>
            ))}
          </div>
        </MenuItems>
      </Menu>

      <Button color="default" icon onClick={onClear} title="Clear" variant="outlined">
        <IconTrash className="h-4 w-4" />
      </Button>
    </div>
  );
}
