import { FormattedDuration } from '../active-setlist/FormattedDuration';

type SongMetadataProps = {
  duration?: number;
  keyNote?: string;
  timeSignature?: string;
};

export function SongMetadata({ duration, keyNote, timeSignature }: SongMetadataProps) {
  const metadataParts = [
    keyNote,
    timeSignature,
    duration !== undefined ? <FormattedDuration key="duration" seconds={duration} /> : null,
  ].filter(Boolean);

  return (
    <div className="flex shrink-0 items-center text-xs text-slate-400">
      {metadataParts.map((part, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="px-1 text-slate-500">•</span>}
          {typeof part === 'string' ? <span>{part}</span> : part}
        </div>
      ))}
    </div>
  );
}
