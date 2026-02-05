import { IconTrash } from '@tabler/icons-react';
import type { ComponentPropsWithoutRef } from 'react';

import { Button } from './Button';

type DeleteButtonProps = { title?: string } & Omit<
  ComponentPropsWithoutRef<'button'>,
  'children' | 'color' | 'title'
>;

export function DeleteButton({ title = 'Delete', ...props }: DeleteButtonProps) {
  return (
    <Button color="danger" icon title={title} type="button" variant="outlined" {...props}>
      <IconTrash className="h-4 w-4" />
    </Button>
  );
}
