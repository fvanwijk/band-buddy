import { Slider } from '../../../ui/Slider';
import { ResetButton } from '../reset-button/ResetButton';
import { SettingHeading } from '../setting-heading/SettingHeading';

type ZoomPanelProps = {
  onZoomChange: (zoom: number) => void;
  zoom: number;
};

export function ZoomPanel({ onZoomChange, zoom }: ZoomPanelProps) {
  return (
    <div className="bg-slate-800/20 p-3">
      <SettingHeading
        resetButton={
          zoom !== 1 && <ResetButton onClick={() => onZoomChange(1)} title="Reset zoom to 1×" />
        }
      >
        Zoom lyrics
      </SettingHeading>
      <Slider
        ariaLabel="Zoom"
        defaultValue={1}
        max={2}
        maxLabel="2×"
        min={0.75}
        minLabel="0.75×"
        onChange={(e) => onZoomChange(parseFloat(e.target.value))}
        step={0.05}
        value={zoom}
      />
      <p className="mt-1 text-center text-xs font-semibold text-brand-200">{zoom.toFixed(2)}×</p>
    </div>
  );
}
