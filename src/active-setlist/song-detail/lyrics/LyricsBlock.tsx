import { IconMicrophone2Off } from '@tabler/icons-react';
import { Chord as TonalChord } from 'tonal';

import { Chord } from './Chord';
import { EmptyStateBlock } from '../../../ui/EmptyStateBlock';

type LyricsBlockProps = {
  lyrics?: string;
  transpose?: number;
};

export function LyricsBlock({ lyrics, transpose = 0 }: LyricsBlockProps) {
  const chordTokenPattern = /^([([{"'`]*)((?:.|\n)*?)([)\]}'"`,.;:!?]*)$/;

  const splitToken = (token: string) => {
    const match = token.match(chordTokenPattern);
    return match
      ? { core: match[2], leading: match[1], trailing: match[3] }
      : { core: token, leading: '', trailing: '' };
  };

  const normalizeChord = (value: string) => value.replace(/♭/g, 'b').replace(/♯/g, '#');

  const isChordToken = (token: string) => {
    const { core } = splitToken(token);
    const normalized = normalizeChord(core);
    const hasUppercaseRoot = /^[A-G]/.test(core);
    return hasUppercaseRoot && normalized.length > 0 && !TonalChord.get(normalized).empty;
  };

  return lyrics ? (
    <div className="flex flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <pre className="whitespace-pre font-mono text-sm text-slate-200 leading-relaxed">
        {lyrics.split(/(\s+)/).map((token, index) => {
          if (!token.trim()) {
            return token;
          }

          if (!isChordToken(token)) {
            return token;
          }

          const { core, leading, trailing } = splitToken(token);
          return (
            <span key={`chord-${index}`}>
              {leading}
              <Chord transpose={transpose}>{core}</Chord>
              {trailing}
            </span>
          );
        })}
      </pre>
    </div>
  ) : (
    <EmptyStateBlock icon={<IconMicrophone2Off className="h-8 w-8" />}>
      No lyrics added yet
    </EmptyStateBlock>
  );
}
