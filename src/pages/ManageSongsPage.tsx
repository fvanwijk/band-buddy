import { mockSetlist } from "../data/setlist";

function ManageSongsPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Library
          </p>
          <h1 className="text-2xl font-semibold text-slate-100">Songs</h1>
        </div>
        <button className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
          New song
        </button>
      </header>

      <div className="grid gap-4">
        {mockSetlist.songs.map((song) => (
          <div
            key={song.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  {song.title}
                </h2>
                <p className="text-sm text-slate-400">{song.artist}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full bg-slate-900/70 px-3 py-1">
                  {song.timeSignature}
                </span>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-200">
                  {song.key}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Reuse this song in multiple setlists once persistence is added.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ManageSongsPage;
