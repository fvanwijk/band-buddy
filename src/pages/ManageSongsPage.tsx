import { useTable } from "tinybase/ui-react";

function ManageSongsPage() {
  const songs = useTable("songs");
  const songIds = Object.keys(songs);

  return (
    <section className="flex h-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">
            Library
          </p>
          <h1 className="text-2xl font-semibold text-slate-100">Songs</h1>
        </div>
        <button className="rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
          New song
        </button>
      </header>

      {songIds.length === 0 ? (
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
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">
            No songs in your library
          </h2>
          <p className="text-slate-400 max-w-md">
            Add songs to build your repertoire and use them in setlists.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {songIds.map((songId) => {
            const song = songs[songId];

            return (
              <div
                key={songId}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">
                      {song.title as string}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {song.artist as string}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-full bg-slate-900/70 px-3 py-1">
                      {song.timeSignature as string}
                    </span>
                    <span className="rounded-full bg-brand-400/10 px-3 py-1 text-brand-200">
                      {song.key as string}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  Reuse this song in multiple setlists once persistence is
                  added.
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ManageSongsPage;
