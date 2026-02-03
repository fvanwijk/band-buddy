import { ColorThemeCard } from './ColorThemeCard';
import { LocaleCard } from './LocaleCard';

export function GeneralSettings() {
  return (
    <div className="flex flex-col gap-4">
      <ColorThemeCard />
      <LocaleCard />
    </div>
  );
}
