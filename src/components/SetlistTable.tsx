import type { Song } from "../types/setlist";

type SetlistTableProps = {
  songs: Song[];
};

type SongRowProps = {
  song: Song;
};

function SongRow({ song }: SongRowProps) {
  return (
    <li className="grid gap-4 px-6 py-5 text-lg text-slate-200 transition hover:bg-slate-900/80 sm:grid-cols-[3fr_1fr_1fr]">
      <span className="flex flex-col">
        <span className="text-xl font-semibold text-slate-100">
          {song.title}
        </span>
        <span className="text-base text-slate-400">{song.artist}</span>
      </span>
      <span className="text-right text-xl font-semibold text-slate-100">
        {song.timeSignature}
      </span>
      <span className="text-right text-xl font-semibold text-emerald-200">
        {song.key}
      </span>
    </li>
  );
}

function SetlistTable({ songs }: SetlistTableProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/40">
      <div className="grid gap-4 border-b border-slate-800 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 sm:grid-cols-[3fr_1fr_1fr]">
        <span>Song</span>
        <span className="text-right">Time</span>
        <span className="text-right">Key</span>
      </div>
      <ul className="flex-1 divide-y divide-slate-800 overflow-y-auto">
        {songs.map((song) => (
          <SongRow key={song.id} song={song} />
        ))}
      </ul>
    </section>
  );
}

export default SetlistTable;
