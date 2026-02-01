type SongStatProps = {
  label: string;
  value: string | number;
  valueClassName?: string;
};

export function SongStat({ label, value, valueClassName }: SongStatProps) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={valueClassName || 'font-semibold text-slate-100'}>{value}</p>
    </div>
  );
}
