import { Interval, Chord as TonalChord } from 'tonal';

type ChordProps = {
  children: string;
  transpose?: number;
};

const normalizeChord = (value: string) => value.replace(/♭/g, 'b').replace(/♯/g, '#');

const transposeChord = (value: string, transpose: number) => {
  if (transpose === 0) {
    return value;
  }

  const interval = Interval.fromSemitones(transpose);
  return TonalChord.transpose(value, interval);
};

export function Chord({ children, transpose = 0 }: ChordProps) {
  const normalized = normalizeChord(children);
  const transposed = transposeChord(normalized, transpose);

  return <strong className="font-semibold text-brand-300">{transposed}</strong>;
}
