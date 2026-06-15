import { useGetInstruments } from '../../api/useInstruments';
import type { MidiEventLogEntry } from '../../midi/useMidiEventLog';
import {
  getInstrumentControlChangeControllerLabel,
  getInstrumentProgramChangeLabel,
} from '../../songs/form/midi/instrumentMidiLookupTables';
import type { Instrument } from '../../types';

type MidiEventLogProps = {
  allCapturedCount: number;
  entries: MidiEventLogEntry[];
};

function findInstrumentForEntry(
  entry: MidiEventLogEntry,
  instruments: Instrument[],
): Instrument | undefined {
  return instruments.find((instrument) => {
    // Important: instrument MIDI IDs are stored from the instrument's perspective,
    // so outbound WebMIDI output IDs match midiInId and inbound WebMIDI input IDs match midiOutId.
    if (entry.direction === 'out') {
      return instrument.midiInId === entry.deviceId;
    }

    return instrument.midiOutId === entry.deviceId;
  });
}

const getDeviceLabel = (entry: MidiEventLogEntry, instrument: Instrument | undefined): string => {
  return instrument?.name || entry.deviceName;
};

const getTypeLabel = (entry: MidiEventLogEntry, instrument: Instrument | undefined): string => {
  const { data, type, value } = entry;

  switch (type) {
    case 'programChange': {
      if (typeof value !== 'number') {
        return 'Program Change';
      }

      const label = getInstrumentProgramChangeLabel(instrument, value);
      return label ? `Program Change ${label}` : `Program Change (${value})`;
    }
    case 'cc': {
      if (typeof value !== 'number') {
        return 'CC';
      }

      const controllerLabel = getInstrumentControlChangeControllerLabel(instrument, value);
      const controlValue = data[2];

      if (typeof controlValue !== 'number') {
        return controllerLabel ? `CC ${controllerLabel}` : `CC ${value}`;
      }

      if (controllerLabel) {
        return `CC ${controllerLabel} = ${controlValue}`;
      }

      return `CC ${value} = ${controlValue}`;
    }
    case 'noteOn':
      return `Note On (${value})`;
    case 'noteOff':
      return `Note Off (${value})`;
    case 'unknown':
      return 'Unknown';
  }
};

const formatChannels = (channels: number[]): string => {
  if (channels.length === 0) {
    return 'System';
  }

  if (channels.length === 1) {
    return `Ch ${channels[0]}`;
  }

  const sorted = [...channels].sort((a, b) => a - b);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  if (last - first === sorted.length - 1) {
    return `Ch ${first}–${last}`;
  }

  return `Ch ${sorted.join(', ')}`;
};

const GROUPING_WINDOW_MS = 100;

const groupEntries = (entries: MidiEventLogEntry[]): MidiEventLogEntry[] => {
  const grouped: MidiEventLogEntry[] = [];

  for (const entry of entries) {
    const last = grouped[grouped.length - 1];

    if (
      last &&
      last.direction === entry.direction &&
      last.type === entry.type &&
      last.value === entry.value &&
      last.deviceId === entry.deviceId &&
      Math.abs(entry.timestamp - last.timestamp) <= GROUPING_WINDOW_MS
    ) {
      grouped[grouped.length - 1] = {
        ...last,
        channels: [...new Set([...last.channels, ...entry.channels])].sort((a, b) => a - b),
      };
    } else {
      grouped.push(entry);
    }
  }

  return grouped;
};

const getDirectionColor = (direction: 'in' | 'out'): string => {
  return direction === 'in' ? 'text-blue-300' : 'text-green-300';
};

const getDirectionLabel = (direction: 'in' | 'out'): string => {
  return direction === 'in' ? 'IN' : 'OUT';
};

export function MidiEventLog({ allCapturedCount, entries }: MidiEventLogProps) {
  const grouped = groupEntries(entries);
  const instruments = useGetInstruments();

  if (grouped.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-400">
        {allCapturedCount === 0 ? (
          <>
            <p className="text-center text-sm">No MIDI events captured yet.</p>
            <p className="text-center text-xs">Send or receive MIDI messages to see them here.</p>
          </>
        ) : (
          <>
            <p className="text-center text-sm">All events are filtered out.</p>
            <p className="text-center text-xs">Enable Input or Output above to see events.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      {grouped.map((entry, index) => {
        const instrument = findInstrumentForEntry(entry, instruments);

        return (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs"
          >
            {/* Header row: direction, device, timestamp */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`font-mono font-semibold ${getDirectionColor(entry.direction)}`}>
                  {getDirectionLabel(entry.direction)}
                </span>
                <span className="text-slate-400">{getDeviceLabel(entry, instrument)}</span>
              </div>
              <span className="text-slate-500">
                {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                  fractionalSecondDigits: 3,
                  hour: '2-digit',
                  hour12: false,
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>

            {/* Type and value */}
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-slate-200">
                {getTypeLabel(entry, instrument)}
              </span>
              <span className="text-slate-500">{formatChannels(entry.channels)}</span>
            </div>

            {/* Raw data */}
            <div className="font-mono text-slate-500">
              Raw:{' '}
              {entry.data
                .map((byte) => `0x${byte.toString(16).toUpperCase().padStart(2, '0')}`)
                .join(' ')}
            </div>
          </div>
        );
      })}
    </div>
  );
}
