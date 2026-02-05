import { IconPencil } from '@tabler/icons-react';
import type { ComponentPropsWithoutRef } from 'react';
import { Link } from 'react-router-dom';

import { Button } from './Button';

type EditButtonProps = {
  title?: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, 'children' | 'color' | 'title'>;

export function EditButton({ title = 'Edit', ...props }: EditButtonProps) {
  return (
    <Button as={Link} icon title={title} variant="outlined" {...props}>
      <IconPencil className="h-4 w-4" />
    </Button>
  );
}
