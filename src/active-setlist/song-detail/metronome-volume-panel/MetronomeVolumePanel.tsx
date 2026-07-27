import { useGetMetronomeVolume, useSetMetronomeVolume } from '../../../api/useSettings';
import { GridCell } from '../../../settings/GridCell';
import { Slider } from '../../../ui/Slider';
import { SettingHeading } from '../setting-heading/SettingHeading';

export function MetronomeVolumePanel() {
  const volume = useGetMetronomeVolume();
  const setVolume = useSetMetronomeVolume();

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
    </GridCell>
  );
}
