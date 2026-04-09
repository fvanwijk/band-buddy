import { IconRefresh } from '@tabler/icons-react';

import { Button } from '../../../ui/Button';

export function ResetButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <Button
      className="h-6 w-6 p-1! text-xs"
      isIcon
      onClick={onClick}
      title={title}
      type="button"
      variant="text"
    >
      <IconRefresh className="h-3 w-3" />
    </Button>
  );
}
