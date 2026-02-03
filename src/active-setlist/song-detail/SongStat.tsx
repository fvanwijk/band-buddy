type SongStatProps = {
  label: string;
  value: string | number;
};

export function SongStat({ label, value }: SongStatProps) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-100">{value}</p>
    </div>
  );
}
