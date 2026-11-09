import { IconDeviceFloppy } from '@tabler/icons-react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../Button';

type FormActionsProps = {
  backPath: string;
  submitLabel: string;
};

export const FormActions: FC<FormActionsProps> = ({ backPath, submitLabel }) => (
  <div className="sticky bottom-4 z-20 -mx-4 mt-4 flex justify-end gap-3 px-4">
    <Button as={Link} to={backPath} size="large" type="button" variant="outlined">
      Cancel
    </Button>
    <Button
      color="primary"
      iconStart={<IconDeviceFloppy className="h-4 w-4" />}
      size="large"
      type="submit"
      variant="filled"
    >
      {submitLabel}
    </Button>
  </div>
);
