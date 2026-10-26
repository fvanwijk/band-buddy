import {
  useGetMetronomeVolume,
  useGetPreCountVolume,
  useSetMetronomeVolume,
  useSetPreCountVolume,
} from '../../../api/useSettings';
import { GridCell } from '../../../settings/GridCell';
import { Slider } from '../../../ui/Slider';
import { SettingHeading } from '../setting-heading/SettingHeading';

export function MetronomeVolumePanel() {
  const volume = useGetMetronomeVolume();
  const setVolume = useSetMetronomeVolume();
  const preCountVolume = useGetPreCountVolume();
  const setPreCountVolume = useSetPreCountVolume();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handlePreCountVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreCountVolume(parseFloat(e.target.value));
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
      <div className="mt-3">
        <SettingHeading>Pre count volume</SettingHeading>
        <div className="space-y-2">
          <Slider
            ariaLabel="Pre count volume"
            max={100}
            min={0}
            onChange={handlePreCountVolumeChange}
            step={1}
            value={preCountVolume}
          />
          <p className="text-center text-xs font-semibold text-brand-200">
            {preCountVolume > 0 ? `${Math.round(preCountVolume)}%` : 'Off'}
          </p>
        </div>
      </div>
    </GridCell>
  );
}
