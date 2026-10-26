import type { FC } from 'react';

import type { EventPatch } from '../../../song-events/editEvents';
import type { MidiButtonEvent, MidiEvent } from '../../../types';
import { SelectField } from '../../../ui/form/SelectField';

type MidiButtonFieldsProps = {
  event: MidiButtonEvent;
  midiEvents: MidiEvent[];
  onChange: (patch: EventPatch) => void;
};

export const MidiButtonFields: FC<MidiButtonFieldsProps> = ({ event, midiEvents, onChange }) => (
  <SelectField
    hideLabel
    label="MIDI button"
    onChange={(changeEvent) => onChange({ midiEventId: changeEvent.target.value })}
    options={midiEvents.map((midiEvent) => ({ label: midiEvent.label, value: midiEvent.id }))}
    size="small"
    value={event.midiEventId}
  />
);
