import {
  useGetMetronomeVolume,
  useGetPreCountEnabled,
  useSetMetronomeVolume,
  useSetPreCountEnabled,
} from '../../../api/useSettings';
import { GridCell } from '../../../settings/GridCell';
import { Checkbox } from '../../../ui/Checkbox';
import { Slider } from '../../../ui/Slider';
import { SettingHeading } from '../setting-heading/SettingHeading';

export function MetronomeVolumePanel() {
  const volume = useGetMetronomeVolume();
  const setVolume = useSetMetronomeVolume();
  const preCountEnabled = useGetPreCountEnabled();
  const setPreCountEnabled = useSetPreCountEnabled();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <GridCell className="p-3">
      <SettingHeading>Metronome volume</SettingHeading>
      <div className="space-y-2">
        <Slider
          ariaLabel="Metronome volume"
          max={100}
          min={0}
          onChange={handleVolumeChange}
          step={1}
          value={volume}
        />
        <p className="text-center text-xs font-semibold text-brand-200">{Math.round(volume)}%</p>
      </div>
      <Checkbox
        checked={preCountEnabled}
        className="mt-3"
        label="Pre count"
        onChange={(e) => setPreCountEnabled(e.target.checked)}
      />
    </GridCell>
  );
}
