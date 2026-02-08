import { SettingHeading } from './SettingHeading';
import { useGetMetronomeVolume, useSetMetronomeVolume } from '../../api/useSettings';

export function MetronomeVolumePanel() {
  const volume = useGetMetronomeVolume();
  const setVolume = useSetMetronomeVolume();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="space-y-3">
      <SettingHeading>Metronome volume</SettingHeading>
      <div className="space-y-2">
        <input
          aria-label="Metronome volume"
          className="accent-brand-400 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800"
          max="100"
          min="0"
          onChange={handleVolumeChange}
          step="1"
          type="range"
          value={volume}
        />
        <p className="text-center text-sm text-slate-400">{Math.round(volume)}%</p>
      </div>
    </div>
  );
}
