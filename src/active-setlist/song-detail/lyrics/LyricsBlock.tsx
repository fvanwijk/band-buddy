import { Chord as TonalChord } from 'tonal';

import { Chord, transposeChord } from './Chord';

type LyricsBlockProps = {
  lyrics?: string;
  transpose?: number;
};

const normalizeChordToken = (token: string) =>
  token
    .replace(/♭/g, 'b')
    .replace(/♯/g, '#')
    .replace(/-(5|9|11|13)\b/g, 'b$1');

const isChordToken = (token: string) => {
  if (!/^[A-G]/.test(token)) return false;
  const normalized = normalizeChordToken(token);
  return !TonalChord.get(normalized).empty;
};

export function LyricsBlock({ lyrics, transpose = 0 }: LyricsBlockProps) {
  let spacesToConsume = 0;

  return (
    <div className="flex flex-1 flex-col p-6">
      <pre className="font-mono text-sm leading-relaxed whitespace-pre text-slate-200">
        {lyrics?.split(/(\s+)/).map((token, index) => {
          if (!token.trim()) {
            if (/\r|\n/.test(token)) {
              spacesToConsume = 0;
              return token;
            }

            if (spacesToConsume > 0) {
              const trimmed = token.replace(new RegExp(`^[ \\t]{0,${spacesToConsume}}`), '');
              spacesToConsume -= token.length - trimmed.length;
              return trimmed;
            }

            return token;
          }

          if (!isChordToken(token)) {
            spacesToConsume = 0;
            return token;
          }

          const transposed = transposeChord(token, transpose);
          const widthDiff = token.length - transposed.length;

          if (widthDiff < 0) {
            spacesToConsume += -widthDiff;
          }

          const trailingPadding = widthDiff > 0 ? ' '.repeat(widthDiff) : '';

          return (
            <span key={`chord-${index}`}>
              <Chord transpose={transpose}>{token}</Chord>
              {trailingPadding}
            </span>
          );
        })}
      </pre>
    </div>
  );
}
