import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { GeneralSettings } from './general/GeneralSettings';
import { InstrumentsSettings } from './instruments/InstrumentsSettings';
import { Page } from '../ui/Page';
import { PageHeader } from '../ui/PageHeader';
import { Tabs } from '../ui/Tabs';
import { WelcomeModal } from '../ui/WelcomeModal';

export function SettingsPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  const selectedTab = tab && ['general', 'instruments'].includes(tab) ? tab : 'general';

  const handleTabChange = (tabId: string) => {
    navigate(`/settings/${tabId}`);
  };

  const handleShowWelcome = () => {
    setIsWelcomeOpen(true);
  };

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
  };

  return (
    <Page>
      <PageHeader title="Preferences" subtitle="Settings" />

      <Tabs
        activeTabId={selectedTab}
        onTabChange={handleTabChange}
        tabs={[
          {
            content: <GeneralSettings onShowWelcome={handleShowWelcome} />,
            id: 'general',
            label: 'General',
          },
          {
            content: <InstrumentsSettings />,
            id: 'instruments',
            label: 'Instruments',
          },
        ]}
      />

      <WelcomeModal isOpen={isWelcomeOpen} onClose={handleCloseWelcome} />
    </Page>
  );
}
