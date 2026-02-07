import { ResetButton } from './ResetButton';
import { SettingHeading } from './SettingHeading';

type ZoomPanelProps = {
  onZoomChange: (zoom: number) => void;
  zoom: number;
};

export function ZoomPanel({ onZoomChange, zoom }: ZoomPanelProps) {
  return (
    <>
      <SettingHeading
        resetButton={
          zoom !== 1 && <ResetButton onClick={() => onZoomChange(1)} title="Reset zoom to 1×" />
        }
      >
        Zoom
      </SettingHeading>
      <div className="relative flex items-center gap-2">
        <span className="text-xs text-slate-400">0.75×</span>
        <div className="relative flex-1">
          <input
            type="range"
            min="0.75"
            max="2"
            step="0.05"
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="accent-brand-500 w-full"
          />
          <div
            className="pointer-events-none absolute top-1/2 h-2 w-0.5 bg-slate-500"
            style={{
              left: `${((1 - 0.75) / (2 - 0.75)) * 100}%`,
              transform: 'translate(calc(-50% + 5px), 8px)',
            }}
          />
        </div>
        <span className="text-xs text-slate-400">2×</span>
      </div>
      <p className="text-brand-200 mt-1 text-center text-xs font-semibold">{zoom.toFixed(2)}×</p>
    </>
  );
}
