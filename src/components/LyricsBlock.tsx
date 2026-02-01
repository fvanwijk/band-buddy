import { Chord } from './Chord';

type LyricsBlockProps = {
  lyrics?: string;
};

export function LyricsBlock({ lyrics }: LyricsBlockProps) {
  const chordPattern =
    /^[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:sus\d+)?(?:add\d+)?(?:maj\d+)?(?:dim\d+)?(?:aug\d+)?(?:\/[A-G](?:#|b)?)?$/i;

  const isChordToken = (token: string) => {
    const normalized = token.replace(/^[([{"'`]+|[)\]}'"`,.;:!?]+$/g, '');
    return normalized.length > 0 && chordPattern.test(normalized);
  };

  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      {lyrics ? (
        <pre className="whitespace-pre-wrap font-mono text-sm text-slate-200 leading-relaxed">
          {lyrics
            .split(/(\s+)/)
            .map((token, index) =>
              isChordToken(token) ? <Chord key={`chord-${index}`}>{token}</Chord> : token,
            )}
        </pre>
      ) : (
        <p className="text-slate-400">No lyrics added yet</p>
      )}
    </div>
  );
}
