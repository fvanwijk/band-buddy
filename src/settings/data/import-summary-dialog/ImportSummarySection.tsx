import type { FC } from 'react';

type ImportSummarySectionProps = {
  count: number;
  items?: string[];
  label: string;
};

// `items` is optional so large lists (e.g. songs) can show a count without listing every entry.
export const ImportSummarySection: FC<ImportSummarySectionProps> = ({ count, items, label }) => (
  <div>
    <div className="flex justify-between font-medium">
      <span>{label}</span>
      <span>{count}</span>
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
