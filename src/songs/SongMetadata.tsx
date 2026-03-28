import { FormattedDuration } from '../active-setlist/FormattedDuration';

type SongMetadataProps = {
  duration?: number;
  keyNote?: string;
  transpose?: number;
  timeSignature?: string;
};

const formatTranspose = (transpose: number) => (transpose > 0 ? `+${transpose}` : `${transpose}`);

export function SongMetadata({ duration, keyNote, timeSignature, transpose }: SongMetadataProps) {
  const transposeLabel = transpose ? formatTranspose(transpose) : null;
  const metadataParts = [
    keyNote ? (
      <span>
        {keyNote}
        {transposeLabel && (
          <span className="ml-0.5 font-medium text-brand-200">{transposeLabel}</span>
        )}
      </span>
    ) : null,
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
