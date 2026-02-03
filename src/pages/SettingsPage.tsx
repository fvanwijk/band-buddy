import { useNavigate, useParams } from 'react-router-dom';

import { GeneralSettings } from '../components/GeneralSettings';
import { InstrumentsSettings } from '../components/InstrumentsSettings';
import { Page } from '../components/Page';
import { PageHeader } from '../components/PageHeader';
import { Tabs } from '../components/Tabs';

function SettingsPage() {
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

export default SettingsPage;
