import type { FC } from 'react';

type ImportSummarySectionProps = {
  count: number;
  items?: string[];
  label: string;
  matchLabel?: string;
};

// `items` is optional so large lists (e.g. songs) can show a count without listing every entry.
export const ImportSummarySection: FC<ImportSummarySectionProps> = ({
  count,
  items,
  label,
  matchLabel,
}) => (
  <div>
    <div className="flex items-baseline justify-between font-medium">
      <span>{label}</span>
      <span>
        {matchLabel && (
          <span className="mr-2 text-xs font-normal text-slate-500">{matchLabel}</span>
        )}
        {count}
      </span>
    </div>
    {items && items.length > 0 && (
      <ul className="space-y-1 pl-4 text-slate-400">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )}
  </div>
);
