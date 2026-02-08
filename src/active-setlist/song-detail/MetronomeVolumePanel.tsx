import { SettingHeading } from './SettingHeading';
import { useGetMetronomeVolume, useSetMetronomeVolume } from '../../api/useSettings';
import { Slider } from '../../ui/Slider';

export function MetronomeVolumePanel() {
  const volume = useGetMetronomeVolume();
  const setVolume = useSetMetronomeVolume();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="space-y-3 bg-slate-800/20 p-3">
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
        <p className="text-brand-200 text-center text-xs font-semibold">{Math.round(volume)}%</p>
      </div>
    </div>
  );
}
