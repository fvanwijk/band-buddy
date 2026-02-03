import { formatDate } from '../utils/date';

type SetlistHeaderProps = {
  name: string;
  date: string;
  venue?: string;
  songCount: number;
};

export function SetlistHeader({ name, date, venue, songCount }: SetlistHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold text-slate-100 sm:text-xl">{name}</h1>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-300">
        <span className="rounded-full bg-slate-900/70 px-3 py-1">{formatDate(date)}</span>
        {venue && <span className="rounded-full bg-slate-900/70 px-3 py-1">{venue}</span>}
        <span className="rounded-full bg-brand-400/10 px-3 py-1 text-brand-200">
          {songCount} songs
        </span>
      </div>
    </header>
  );
}
