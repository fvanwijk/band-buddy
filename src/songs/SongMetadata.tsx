import { FormattedDuration } from '../active-setlist/FormattedDuration';

type SongMetadataProps = {
  duration?: number;
  keyNote?: string;
  timeSignature?: string;
};

export function SongMetadata({ duration, keyNote, timeSignature }: SongMetadataProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
      {[
        keyNote,
        timeSignature,
        duration !== undefined ? <FormattedDuration key="duration" seconds={duration} /> : null,
      ]
        .filter(Boolean)
        .map((part, index) => (
          <div key={index}>
            {index > 0 && <span>•</span>}
            {typeof part === 'string' ? <span>{part}</span> : part}
          </div>
        ))}
    </div>
  );
}
