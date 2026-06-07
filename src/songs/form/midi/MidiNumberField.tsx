import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { InputField } from '../../../ui/form/InputField';

type MidiNumberFieldProps = {
  error: FieldError | undefined;
  label: string;
  max: number;
  min: number;
  placeholder: string;
  registration: UseFormRegisterReturn;
  required?: boolean;
};

export function MidiNumberField({
  error,
  label,
  max,
  min,
  placeholder,
  registration,
  required = false,
}: MidiNumberFieldProps) {
  return (
    <InputField
      error={error}
      label={label}
      max={String(max)}
      min={String(min)}
      placeholder={placeholder}
      {...registration}
      required={required}
      type="number"
    />
  );
}
