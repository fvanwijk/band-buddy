import type { FC } from 'react';

import type { EventPatch } from '../../../song-events/editEvents';
import type { TempoChangeEvent } from '../../../types';
import { InputField } from '../../../ui/form/InputField';
import { applyOnEnter, readClampedInteger } from './numberInput';

const MIN_BPM = 1;
const MAX_BPM = 300;

type TempoFieldsProps = {
  event: TempoChangeEvent;
  onChange: (patch: EventPatch) => void;
};

export const TempoFields: FC<TempoFieldsProps> = ({ event, onChange }) => (
  <InputField
    className="max-w-32"
    defaultValue={event.bpm}
    helperText="BPM from this measure on. A one measure count-in is spoken before it."
    hideLabel
    label="Tempo (BPM)"
    max={MAX_BPM}
    min={MIN_BPM}
    onBlur={(blurEvent) => {
      const bpm = readClampedInteger(blurEvent, {
        fallback: event.bpm,
        max: MAX_BPM,
        min: MIN_BPM,
      });
      if (bpm !== event.bpm) {
        onChange({ bpm });
      }
    }}
    onKeyDown={applyOnEnter}
    size="small"
    type="number"
  />
);
