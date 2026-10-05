import { IconTrash } from '@tabler/icons-react';

import { Button } from './Button';
import type { ButtonProps } from './Button';

type DeleteButtonProps = Omit<ButtonProps<'button'>, 'as' | 'children' | 'isIcon'>;

export function DeleteButton({ title = 'Delete', ...props }: DeleteButtonProps) {
  return (
    <Button color="danger" isIcon title={title} type="button" variant="outlined" {...props}>
      <IconTrash className={props.size === 'small' ? 'h-3 w-3' : 'h-4 w-4'} />
    </Button>
  );
}
