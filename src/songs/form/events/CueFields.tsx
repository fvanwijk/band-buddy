import type { FC } from 'react';

import type { EventPatch } from '../../../song-events/editEvents';
import type { CueEvent } from '../../../types';
import { Checkbox } from '../../../ui/Checkbox';
import { InputField } from '../../../ui/form/InputField';

type CueFieldsProps = {
  event: CueEvent;
  onChange: (patch: EventPatch) => void;
};

export const CueFields: FC<CueFieldsProps> = ({ event, onChange }) => (
  <div className="flex flex-col gap-2">
    <InputField
      hideLabel
      label="Cue text"
      onChange={(changeEvent) => onChange({ text: changeEvent.target.value })}
      placeholder="Text to speak"
      size="small"
      value={event.text}
    />
    <Checkbox
      checked={event.preCount ?? false}
      label="Pre count"
      onChange={(changeEvent) => onChange({ preCount: changeEvent.target.checked })}
    />
  </div>
);
