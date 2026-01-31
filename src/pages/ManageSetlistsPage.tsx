import { useTable } from 'tinybase/ui-react';

function ManageSetlistsPage() {
  const setlists = useTable('setlists');
  const setlistIds = Object.keys(setlists);

  return (
    <section className="flex h-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">Manage</p>
          <h1 className="text-2xl font-semibold text-slate-100">Setlists</h1>
        </div>
        <button className="rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
          New setlist
        </button>
      </header>

      {setlistIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-16">
          <div className="rounded-full bg-brand-400/10 p-6 mb-4">
            <svg
              className="w-12 h-12 text-brand-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">No setlists yet</h2>
          <p className="text-slate-400 max-w-md">
            Create your first setlist to organize songs for your performances.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {setlistIds.map((setlistId) => {
            const setlist = setlists[setlistId];
            const songCount = (setlist.songIds as string)?.split(',').length || 0;

            return (
              <div
                key={setlistId}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <h2 className="text-lg font-semibold text-slate-100">{setlist.name as string}</h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full bg-slate-900/70 px-3 py-1">
                    {setlist.date as string}
                  </span>
                  <span className="rounded-full bg-slate-900/70 px-3 py-1">
                    {setlist.venue as string}
                  </span>
                  <span className="rounded-full bg-brand-400/10 px-3 py-1 text-brand-200">
                    {songCount} songs
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  Add, reorder, or edit songs here once persistence is wired up.
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ManageSetlistsPage;
