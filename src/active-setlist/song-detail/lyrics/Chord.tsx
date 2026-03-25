import { Interval, Chord as TonalChord } from 'tonal';

type ChordProps = {
  children: string;
  transpose?: number;
};

const normalizeChord = (value: string) => value.replace(/♭/g, 'b').replace(/♯/g, '#');

export const transposeChord = (value: string, transpose: number) => {
  const normalized = normalizeChord(value);

  if (transpose === 0) {
    return normalized;
  }

  const interval = Interval.fromSemitones(transpose);
  return TonalChord.transpose(normalized, interval);
};

export function Chord({ children, transpose = 0 }: ChordProps) {
  const transposed = transposeChord(children, transpose);

  return <strong className="font-semibold text-brand-300">{transposed}</strong>;
}
