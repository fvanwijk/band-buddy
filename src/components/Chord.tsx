type ChordProps = {
  children: string;
};

export function Chord({ children }: ChordProps) {
  return <strong className="font-semibold text-slate-100">{children}</strong>;
}
