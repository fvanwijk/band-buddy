import { FormattedDuration } from './FormattedDuration';
import { formatDate } from '../utils/date';

type SetlistHeaderProps = {
  date: string;
  name: string;
  songCount: number;
  totalSeconds?: number;
  venue?: string;
};

export function SetlistHeader({ date, name, songCount, totalSeconds, venue }: SetlistHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold text-slate-100 sm:text-xl">{name}</h1>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-300">
        <span className="rounded-full bg-slate-900/70 px-3 py-1">{formatDate(date)}</span>
        {venue && <span className="rounded-full bg-slate-900/70 px-3 py-1">{venue}</span>}
        <span className="bg-brand-400/10 text-brand-200 rounded-full px-3 py-1">
          {songCount} songs
          {totalSeconds !== undefined && (
            <>
              {' • '}
              <FormattedDuration seconds={totalSeconds} />
            </>
          )}
        </span>
      </div>
    </header>
  );
}
