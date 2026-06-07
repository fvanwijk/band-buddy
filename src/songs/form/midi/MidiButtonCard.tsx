import { IconPencil, IconPlayerPlay } from '@tabler/icons-react';

import { sendMidiActionToInstrument } from '../../../midi/sendProgramChangeToInstrument';
import { useMidiDevices } from '../../../midi/useMidiDevices';
import type { Instrument, MidiEvent } from '../../../types';
import { Button } from '../../../ui/Button';
import { DeleteButton } from '../../../ui/DeleteButton';
import {
  getInstrumentControlChangeLabel,
  getInstrumentNrpnLabel,
} from './instrumentMidiLookupTables';
import { getProgramChangeLabel } from './useProgramOptions';

type MidiButtonCardProps = {
  event: MidiEvent;
  instruments: Instrument[];
  isAvailable: boolean;
  onDelete: (eventId: string) => void;
  onEdit: (event: MidiEvent) => void;
};

export function MidiButtonCard({
  event,
  instruments,
  isAvailable,
  onDelete,
  onEdit,
}: MidiButtonCardProps) {
  const { outputs } = useMidiDevices();

  const getActionLabel = (
    action: MidiEvent['events'][number],
    instrument: Instrument | undefined,
  ) => {
    if (action.type === 'controlChange') {
      const label = getInstrumentControlChangeLabel(action, instrument);
      if (label) {
        return label;
      }

      return `CC ${action.controller} = ${action.value}`;
    }

    if (action.type === 'nrpn') {
      const label = getInstrumentNrpnLabel(action, instrument);
      if (label) {
        return label;
      }

      const valueLabel =
        typeof action.valueLsb === 'number'
          ? `${action.valueMsb}:${action.valueLsb}`
          : `${action.valueMsb}`;
      return `NRPN ${action.parameterMsb}:${action.parameterLsb} = ${valueLabel}`;
    }

    if (!action.type || action.type === 'programChange') {
      const programLabel = getProgramChangeLabel(instrument, action.programChange);
      return `Program change ${programLabel ?? action.programChange}`;
    }

    return 'Unknown MIDI action';
  };

  const handleTestEvent = (event: MidiEvent) => {
    event.events.forEach((action) => {
      const instrument = instruments.find((inst) => inst.id === action.instrumentId);
      if (!instrument) {
        return;
      }

      sendMidiActionToInstrument(action, instrument, outputs);
    });
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <div className="flex-1">
        <p className="font-medium text-slate-200">{event.label}</p>
        <div className="space-y-1 text-xs text-slate-500">
          {event.events.map((action, index) => {
            const instrument = instruments.find((inst) => inst.id === action.instrumentId);

            return (
              <p className="flex items-center gap-2" key={`${event.id}-${index}`}>
                <span>{getActionLabel(action, instrument)} -</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  {instrument?.name || 'Unknown'}
                </span>
              </p>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          disabled={!isAvailable}
          isIcon
          onClick={() => handleTestEvent(event)}
          title="Test MIDI button"
          type="button"
          variant="outlined"
        >
          <IconPlayerPlay className="h-4 w-4" />
        </Button>
        <Button
          isIcon
          onClick={() => onEdit(event)}
          title="Edit MIDI button"
          type="button"
          variant="outlined"
        >
          <IconPencil className="h-4 w-4" />
        </Button>
        <DeleteButton onClick={() => onDelete(event.id)} title="Delete MIDI button" />
      </div>
    </div>
  );
}
