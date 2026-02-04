import { AboutCard } from './AboutCard';
import { ColorThemeCard } from './ColorThemeCard';
import { LocaleCard } from './LocaleCard';

type GeneralSettingsProps = {
  onShowWelcome: () => void;
};

export function GeneralSettings({ onShowWelcome }: GeneralSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <ColorThemeCard />
      <LocaleCard />
      <AboutCard onShowWelcome={onShowWelcome} />
    </div>
  );
}
