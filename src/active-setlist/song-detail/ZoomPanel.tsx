import { ResetButton } from './ResetButton';
import { SettingHeading } from './SettingHeading';
import { Slider } from '../../ui/Slider';

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
        Zoom
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
      <p className="text-brand-200 mt-1 text-center text-xs font-semibold">{zoom.toFixed(2)}×</p>
    </div>
  );
}
