import { IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import type { MidiEventLogEntry } from '../../midi/useMidiEventLog';
import { Button } from '../../ui/Button';
import { Checkbox } from '../../ui/Checkbox';
import { MidiEventLog } from './MidiEventLog';

type MidiEventLogPanelProps = {
  entries: MidiEventLogEntry[];
  onClear: () => void;
  onClose: () => void;
};

export function MidiEventLogPanel({ entries, onClear, onClose }: MidiEventLogPanelProps) {
  const [showInput, setShowInput] = useState(true);
  const [showOutput, setShowOutput] = useState(true);

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        if (entry.direction === 'in') {
          return showInput;
        }

        return showOutput;
      }),
    [entries, showInput, showOutput],
  );

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l border-slate-700 bg-slate-950 shadow-lg">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">MIDI Event Log</h2>
          <Button color="default" isIcon onClick={onClose} title="Close panel" variant="text">
            <IconX className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {entries.length === 0
            ? 'No events captured yet'
            : `${filteredEntries.length} of ${entries.length} event${entries.length !== 1 ? 's' : ''} shown`}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <Checkbox
            checked={showInput}
            label="Input"
            onChange={(event) => setShowInput(event.target.checked)}
          />
          <Checkbox
            checked={showOutput}
            label="Output"
            onChange={(event) => setShowOutput(event.target.checked)}
          />
        </div>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-4">
          <MidiEventLog allCapturedCount={entries.length} entries={filteredEntries} />
        </div>
      </div>

      {/* Footer with clear button */}
      <div className="border-t border-slate-700 bg-slate-900 px-4 py-3">
        <Button color="default" onClick={onClear} variant="outlined" className="w-full">
          Clear Log
        </Button>
      </div>
    </div>
  );
}
