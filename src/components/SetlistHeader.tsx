type SetlistHeaderProps = {
  name: string;
  date: string;
  venue: string;
  songCount: number;
};

function SetlistHeader({ name, date, venue, songCount }: SetlistHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
          Gig Buddy
        </span>
        <h1 className="text-lg font-semibold text-slate-100 sm:text-xl">
          {name}
        </h1>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-300">
        <span className="rounded-full bg-slate-900/70 px-3 py-1">{date}</span>
        <span className="rounded-full bg-slate-900/70 px-3 py-1">{venue}</span>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-200">
          {songCount} songs
        </span>
      </div>
    </header>
  );
}

export default SetlistHeader;
