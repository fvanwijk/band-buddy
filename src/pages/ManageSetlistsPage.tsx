import { mockSetlist } from "../data/setlist";

function ManageSetlistsPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">
            Manage
          </p>
          <h1 className="text-2xl font-semibold text-slate-100">Setlists</h1>
        </div>
        <button className="rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
          New setlist
        </button>
      </header>

      <div className="grid gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-slate-100">
            {mockSetlist.name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-full bg-slate-900/70 px-3 py-1">
              {mockSetlist.date}
            </span>
            <span className="rounded-full bg-slate-900/70 px-3 py-1">
              {mockSetlist.venue}
            </span>
            <span className="rounded-full bg-brand-400/10 px-3 py-1 text-brand-200">
              {mockSetlist.songs.length} songs
            </span>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Add, reorder, or edit songs here once persistence is wired up.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ManageSetlistsPage;
