import { IconPencil } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { Button } from './Button';
import type { ButtonProps } from './Button';

type EditButtonProps = Omit<ButtonProps<typeof Link>, 'as' | 'children' | 'isIcon'>;

export function EditButton({ title = 'Edit', ...props }: EditButtonProps) {
  return (
    <Button as={Link} isIcon title={title} variant="outlined" {...props}>
      <IconPencil className={props.size === 'small' ? 'h-3 w-3' : 'h-4 w-4'} />
    </Button>
  );
}
