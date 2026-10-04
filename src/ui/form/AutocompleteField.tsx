import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { useCallback, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';

import { cn } from '../../utils/cn';
import { FormLabel } from './FormLabel';

type AutocompleteOption = { label: string; value: string };

type AutocompleteFieldProps = {
  error?: FieldError;
  helperText?: ReactNode;
  hideLabel?: boolean;
  id?: string;
  label: string;
  name?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  required?: boolean;
  size?: 'medium' | 'small' | 'xsmall';
  value: string;
};

export function AutocompleteField({
  error,
  helperText,
  hideLabel,
  id,
  label,
  name,
  onBlur,
  onChange,
  options,
  placeholder,
  required,
  size = 'medium',
  value,
}: AutocompleteFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [query, setQuery] = useState('');
  const [openUp, setOpenUp] = useState(false);

  // Runs when the list mounts: flip above the input if it doesn't fit below and there is more room above
  const optionsRef = useCallback((list: HTMLElement | null) => {
    const anchor = list?.parentElement;
    if (!list || !anchor) {
      return;
    }
    const { bottom, top } = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - bottom;
    setOpenUp(spaceBelow < list.offsetHeight && top > spaceBelow);
  }, []);

  const labelByValue = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }
    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const inputClass = cn(
    'w-full rounded-lg border border-brand-900 bg-brand-950/40 pr-8 text-slate-100 placeholder-slate-500 hover:border-brand-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none',
    { medium: 'py-2 pl-3', small: 'py-1 pl-2.5', xsmall: 'py-1 pl-2 text-sm' }[size],
  );

  return (
    <div>
      {!hideLabel && (
        <FormLabel className="mb-1.5 block" htmlFor={inputId} required={required}>
          {label}
        </FormLabel>
      )}
      <Combobox
        name={name}
        onChange={(newValue: string | null) => {
          if (newValue !== null) {
            onChange(newValue);
          }
        }}
        onClose={() => setQuery('')}
        value={value}
      >
        <div className="relative">
          <ComboboxInput
            aria-label={hideLabel ? label : undefined}
            className={inputClass}
            displayValue={(selected: string) => labelByValue.get(selected) ?? ''}
            id={inputId}
            onBlur={onBlur}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={(event) => event.target.select()}
            placeholder={placeholder}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 hover:text-slate-200">
            <IconChevronDown className="h-4 w-4" />
          </ComboboxButton>
          <ComboboxOptions
            className={cn(
              'absolute z-50 max-h-60 w-full overflow-auto rounded-lg border border-brand-900 bg-slate-900 p-1 shadow-lg',
              openUp ? 'bottom-full mb-1' : 'mt-1',
            )}
            ref={optionsRef}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <ComboboxOption
                  className="group flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm text-slate-100 select-none data-focus:bg-brand-900/60"
                  key={option.value}
                  value={option.value}
                >
                  <IconCheck className="invisible h-4 w-4 shrink-0 text-brand-400 group-data-selected:visible" />
                  {option.label}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
      {error ? (
        <p className="mt-1 text-xs text-red-400">{error.message}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
