import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from './Button';
import type { MidiEvent } from '../types';
import type { Instrument } from '../types';

type MidiEventsTabProps = {
  instruments: Instrument[];
  midiEvents?: MidiEvent[];
  onAddEvent?: (event: Omit<MidiEvent, 'id'>) => void;
  onDeleteEvent?: (eventId: string) => void;
};

export function MidiEventsTab({
  instruments,
  midiEvents,
  onAddEvent,
  onDeleteEvent,
}: MidiEventsTabProps) {
  const [label, setLabel] = useState('');
  const [instrumentId, setInstrumentId] = useState(instruments[0]?.id || '');
  const [programChange, setProgramChange] = useState(0);

  const handleAddEvent = () => {
    if (!label.trim()) {
      return;
    }
    onAddEvent?.({
      instrumentId,
      label,
      programChange,
    });
    setLabel('');
    setProgramChange(0);
  };

  const instrumentOptions = instruments.map((inst) => ({
    label: inst.name,
    value: inst.id,
  }));

  return (
    <div className="space-y-6">
      {/* Add/Edit Event Form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-200">Add MIDI Button</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="midi-label" className="mb-1.5 block text-sm font-medium text-slate-300">
              Button label <span className="text-red-400">*</span>
            </label>
            <input
              id="midi-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Verse, Chorus, Bridge"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            />
          </div>

          <div>
            <label
              htmlFor="midi-instrument"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Instrument <span className="text-red-400">*</span>
            </label>
            <select
              id="midi-instrument"
              value={instrumentId}
              onChange={(e) => setInstrumentId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            >
              {instrumentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="midi-programChange"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Program Change Number <span className="text-red-400">*</span>
            </label>
            <input
              id="midi-programChange"
              type="number"
              min="0"
              max="127"
              value={programChange}
              onChange={(e) =>
                setProgramChange(Math.max(0, Math.min(127, parseInt(e.target.value) || 0)))
              }
              placeholder="0-127"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            />
          </div>

          <Button color="primary" onClick={handleAddEvent} variant="filled" type="button">
            Add Button
          </Button>
        </div>
      </div>

      {/* Events List */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-200">MIDI Buttons</h3>
        {!midiEvents || midiEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-center text-sm text-slate-400">
            No MIDI buttons yet. Create one above.
          </div>
        ) : (
          <div className="space-y-2">
            {midiEvents.map((event) => {
              const instrument = instruments.find((inst) => inst.id === event.instrumentId);
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-200">{event.label}</p>
                    <p className="text-xs text-slate-500">
                      Program Change {event.programChange} → {instrument?.name || 'Unknown'}
                    </p>
                  </div>
                  <Button
                    color="danger"
                    icon
                    onClick={() => onDeleteEvent?.(event.id)}
                    variant="ghost"
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
