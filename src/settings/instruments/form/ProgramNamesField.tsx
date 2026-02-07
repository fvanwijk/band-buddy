import { useState } from 'react';

import { Button } from '../../../ui/Button';
import { FormLabel } from '../../../ui/form/FormLabel';

type ProgramNamesFieldProps = {
  onChange: (programNames: Record<number, string>) => void;
  value: Record<number, string>;
};

export function ProgramNamesField({ onChange, value }: ProgramNamesFieldProps) {
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [textareaRawValue, setTextareaRawValue] = useState<string>('');

  const handleToggleBulkInput = () => {
    if (!showBulkInput) {
      // Opening - populate textarea with current value
      const lines = Array.from(
        { length: Math.max(...Object.keys(value).map(Number), -1) + 1 },
        (_, i) => value[i] || '',
      );
      setTextareaRawValue(lines.join('\n'));
    }
    setShowBulkInput(!showBulkInput);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    const lines = nextValue.split('\n');
    const newProgramNames: Record<number, string> = {};

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed) {
        newProgramNames[index] = trimmed;
      }
    });

    setTextareaRawValue(nextValue);
    onChange(newProgramNames);
  };

  const programCount = Object.keys(value).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel>Program Names</FormLabel>
        <div className="flex gap-2">
          <Button color="primary" onClick={handleToggleBulkInput} type="button" variant="ghost">
            {showBulkInput ? 'Collapse' : 'Edit'}
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Define custom names for MIDI programs. When set, these will appear in program selection
        dropdowns instead of numbers.
      </p>

      {showBulkInput && (
        <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <FormLabel className="block">
              Paste Program Names
              <span className="ml-2 text-xs text-slate-500">
                (one per line, starting from program 0)
              </span>
            </FormLabel>
            <span className="text-xs text-slate-500">
              {programCount} {programCount === 1 ? 'program' : 'programs'} defined
            </span>
          </div>
          <textarea
            className="focus:border-brand-400 focus:ring-brand-400/20 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:outline-none"
            onChange={handleTextareaChange}
            placeholder="Piano&#10;Electric Piano&#10;Organ&#10;..."
            rows={10}
            value={textareaRawValue}
          />
        </div>
      )}

      {programCount > 0 && !showBulkInput && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <p className="text-xs text-slate-400">
            {programCount} program name{programCount !== 1 ? 's' : ''} configured. Click "Edit" to
            modify.
          </p>
        </div>
      )}
    </div>
  );
}
