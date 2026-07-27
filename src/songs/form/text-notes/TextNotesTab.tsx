import type { UseFormRegisterReturn } from 'react-hook-form';

import { Card } from '../../../ui/Card';
import { InputField } from '../../../ui/form/InputField';

type TextNotesTabProps = {
  register: UseFormRegisterReturn;
};

export function TextNotesTab({ register }: TextNotesTabProps) {
  return (
    <Card>
      <div>
        <InputField
          id="notes"
          label="Notes"
          placeholder="Add notes, chord changes, or reminders..."
          rows={12}
          {...register}
        />
      </div>
    </Card>
  );
}
