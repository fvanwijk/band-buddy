import { IconInfoCircle } from '@tabler/icons-react';

import { Button } from '../../ui/Button';
import { SettingsCard } from '../SettingsCard';

type AboutCardProps = {
  onShowWelcome: () => void;
};

export function AboutCard({ onShowWelcome }: AboutCardProps) {
  return (
    <SettingsCard>
      <h2 className="text-lg font-semibold text-slate-100">About</h2>
      <p className="mt-2 text-sm text-slate-400">
        BandBuddy is your companion for managing band repertoire and live performances.
      </p>

      <div className="mt-4">
        <Button
          iconStart={<IconInfoCircle className="h-4 w-4" />}
          onClick={onShowWelcome}
          variant="outlined"
        >
          Show Welcome Guide
        </Button>
      </div>
    </SettingsCard>
  );
}
