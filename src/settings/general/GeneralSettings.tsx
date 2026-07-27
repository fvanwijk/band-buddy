import { Grid } from '../Grid';
import { AboutCard } from './AboutCard';
import { ColorThemeCard } from './ColorThemeCard';
import { LocaleCard } from './LocaleCard';
import { SpotifyCard } from './SpotifyCard';

type GeneralSettingsProps = {
  onShowWelcome: () => void;
};

export function GeneralSettings({ onShowWelcome }: GeneralSettingsProps) {
  return (
    <Grid>
      <ColorThemeCard />
      <LocaleCard />
      <SpotifyCard />
      <AboutCard onShowWelcome={onShowWelcome} />
    </Grid>
  );
}
