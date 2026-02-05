import { IconPlayerPlay } from '@tabler/icons-react';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DeleteButton } from '../ui/DeleteButton';
import { EditButton } from '../ui/EditButton';
import { formatDate } from '../utils/date';
import { usePluralize } from '../utils/pluralize';

type SetlistCardProps = {
  date: string;
  id: string;
  isActive?: boolean;
  onActivate: () => void;
  onDelete: () => void;
  setsCount: number;
  songsCount: number;
  title: string;
};

export function SetlistCard({
  date,
  id,
  isActive = false,
  onActivate,
  onDelete,
  setsCount,
  songsCount,
  title,
}: SetlistCardProps) {
  const pluralize = usePluralize();

  return (
    <Card
      actions={
        <>
          <Button
            color={isActive ? 'primary' : 'default'}
            icon
            onClick={onActivate}
            title={isActive ? 'Active setlist' : 'Activate setlist'}
            variant={isActive ? 'filled' : 'outlined'}
          >
            <IconPlayerPlay className="h-4 w-4" />
          </Button>
          <EditButton title="Edit setlist" to={`/setlists/edit/${id}`} />
          <DeleteButton onClick={onDelete} title="Delete setlist" />
        </>
      }
    >
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="flex gap-2 text-sm text-slate-400">
        <span>{formatDate(date)}</span>•<span>{pluralize(setsCount, 'set')}</span>•
        <span>{pluralize(songsCount, 'song')}</span>
      </div>
    </Card>
  );
}
