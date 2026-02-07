import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { IconAlertCircle } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

type TabItem = {
  content: ReactNode;
  hasError?: boolean;
  id: string;
  label: string;
};

type TabsProps = {
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  tabs: TabItem[];
};

export function Tabs({ activeTabId, onTabChange, tabs }: TabsProps) {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(0);

  // Determine if this is controlled or uncontrolled
  const isControlled = activeTabId !== undefined;

  // Calculate the selected index
  const controlledIndex = tabs.findIndex((tab) => tab.id === activeTabId);
  const selectedIndex = isControlled
    ? Math.max(0, controlledIndex)
    : Math.min(uncontrolledIndex, tabs.length - 1);

  const handleTabChange = (index: number) => {
    // Update internal state if uncontrolled
    if (!isControlled) {
      setUncontrolledIndex(index);
    }
    // Call the callback if provided
    onTabChange?.(tabs[index].id);
  };

  return (
    <TabGroup selectedIndex={selectedIndex} onChange={handleTabChange}>
      <TabList className="flex gap-2 border-b border-slate-800">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            className={({ selected }: { selected: boolean }) =>
              [
                'flex items-center rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold transition',
                selected
                  ? 'border-brand-400 text-brand-100 bg-slate-900/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200',
              ].join(' ')
            }
          >
            {tab.label}
            {tab.hasError && <IconAlertCircle className="ml-1 inline-block h-4 w-4 text-red-400" />}
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
