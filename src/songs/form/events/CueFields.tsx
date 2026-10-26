import type { FC } from 'react';

import type { EventPatch } from '../../../song-events/editEvents';
import type { CueEvent } from '../../../types';
import { InputField } from '../../../ui/form/InputField';

type CueFieldsProps = {
  event: CueEvent;
  onChange: (patch: EventPatch) => void;
};

export const CueFields: FC<CueFieldsProps> = ({ event, onChange }) => (
  <InputField
    hideLabel
    label="Cue text"
    onChange={(changeEvent) => onChange({ text: changeEvent.target.value })}
    placeholder="Text to speak"
    size="small"
    value={event.text}
  />
);
