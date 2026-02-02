import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import type { ReactNode } from 'react';

type TabItem = {
  content: ReactNode;
  id: string;
  label: string;
};

type TabsProps = {
  tabs: TabItem[];
};

export function Tabs({ tabs }: TabsProps) {
  return (
    <TabGroup>
      <TabList className="flex gap-2 border-b border-slate-800">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            className={({ selected }: { selected: boolean }) =>
              [
                'rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold transition',
                selected
                  ? 'border-brand-400 bg-slate-900/80 text-brand-100'
                  : 'border-transparent text-slate-400 hover:text-slate-200',
              ].join(' ')
            }
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels className="pt-6">
        {tabs.map((tab) => (
          <TabPanel key={tab.id} className="focus:outline-none">
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
