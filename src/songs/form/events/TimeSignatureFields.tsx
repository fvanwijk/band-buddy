import type { FC } from 'react';

import type { EventPatch } from '../../../song-events/editEvents';
import type { TimeSignatureChangeEvent } from '../../../types';
import { SelectField } from '../../../ui/form/SelectField';
import { timeSignatureOptions } from '../timeSignatureOptions';

type TimeSignatureFieldsProps = {
  event: TimeSignatureChangeEvent;
  onChange: (patch: EventPatch) => void;
};

export const TimeSignatureFields: FC<TimeSignatureFieldsProps> = ({ event, onChange }) => {
  const hasOption = timeSignatureOptions.some(({ value }) => value === event.timeSignature);
  const options = hasOption
    ? timeSignatureOptions
    : [...timeSignatureOptions, { label: event.timeSignature, value: event.timeSignature }];

  return (
    <SelectField
      hideLabel
      label="Time signature"
      onChange={(changeEvent) => onChange({ timeSignature: changeEvent.target.value })}
      options={options}
      size="small"
      value={event.timeSignature}
    />
  );
};
