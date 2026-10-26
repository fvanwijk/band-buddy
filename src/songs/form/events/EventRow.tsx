import type { FC, ReactNode } from 'react';

import type { SongEventIssue } from '../../../song-events/validateSongEvents';
import { DeleteButton } from '../../../ui/DeleteButton';
import { cn } from '../../../utils/cn';

type EventRowProps = {
  children: ReactNode;
  icon: ReactNode;
  issues?: SongEventIssue[];
  label: string;
  noun: string;
  onDelete: () => void;
};

export const EventRow: FC<EventRowProps> = ({
  children,
  icon,
  issues = [],
  label,
  noun,
  onDelete,
}) => (
  <div className="flex flex-col gap-1">
    <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 sm:grid-cols-[150px_1fr_auto]">
      <div className="flex items-center gap-2 self-center text-sm text-slate-300" title={label}>
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </div>
      <div>
        {children}
        {issues.map((issue) => (
          <p
            className={cn(
              'mt-1 text-xs',
              issue.severity === 'error' ? 'text-red-400' : 'text-amber-300',
            )}
            key={issue.code}
          >
            {issue.message}
          </p>
        ))}
      </div>
      <DeleteButton onClick={onDelete} title={`Delete ${noun}`} />
    </div>
  </div>
);
