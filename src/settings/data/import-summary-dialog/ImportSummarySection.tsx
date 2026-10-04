import type { FC } from 'react';

import { Checkbox } from '../../../ui/Checkbox';

type ImportSummarySectionProps = {
  checked: boolean;
  count: number;
  items?: string[];
  label: string;
  matchLabel?: string;
  onCheckedChange: (checked: boolean) => void;
};

// `items` is optional so large lists (e.g. songs) can show a count without listing every entry.
export const ImportSummarySection: FC<ImportSummarySectionProps> = ({
  checked,
  count,
  items,
  label,
  matchLabel,
  onCheckedChange,
}) => (
  <div aria-label={label} role="group">
    <div className="flex items-baseline justify-between font-medium">
      <Checkbox
        checked={checked}
        label={label}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <span>
        {checked && matchLabel && (
          <span className="mr-2 text-xs font-normal text-slate-500">{matchLabel}</span>
        )}
        {count}
      </span>
    </div>
    {checked && items && items.length > 0 && (
      <ul className="space-y-1 pl-6 text-slate-400">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )}
  </div>
);
