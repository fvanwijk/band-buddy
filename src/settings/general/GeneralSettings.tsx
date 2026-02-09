import { AboutCard } from './AboutCard';
import { ColorThemeCard } from './ColorThemeCard';
import { LocaleCard } from './LocaleCard';
import { SpotifyCard } from './SpotifyCard';

type GeneralSettingsProps = {
  onShowWelcome: () => void;
};

export function GeneralSettings({ onShowWelcome }: GeneralSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <ColorThemeCard />
      <LocaleCard />
      <SpotifyCard />
      <AboutCard onShowWelcome={onShowWelcome} />
    </div>
  );
}
