import { transposeChord } from './transposeChord';

type ChordProps = {
  children: string;
  songKey?: string;
  transpose?: number;
};

export function Chord({ children, songKey, transpose = 0 }: ChordProps) {
  const transposed = transposeChord(children, transpose, songKey);

  return <strong className="font-semibold text-brand-300">{transposed}</strong>;
}
