import { useNavigate, useParams } from 'react-router-dom';

import { GeneralSettings } from './general/GeneralSettings';
import { InstrumentsSettings } from './instruments/InstrumentsSettings';
import { Page } from '../ui/Page';
import { PageHeader } from '../ui/PageHeader';
import { Tabs } from '../ui/Tabs';

export function SettingsPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  const selectedTab = tab && ['general', 'instruments'].includes(tab) ? tab : 'general';

  const handleTabChange = (tabId: string) => {
    navigate(`/settings/${tabId}`);
  };

  return (
    <Page>
      <PageHeader title="Preferences" subtitle="Settings" />

      <Tabs
        activeTabId={selectedTab}
        onTabChange={handleTabChange}
        tabs={[
          {
            content: <GeneralSettings />,
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
    </Page>
  );
}
