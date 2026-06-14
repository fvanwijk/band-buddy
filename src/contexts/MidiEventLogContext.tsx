import { createContext, useContext } from 'react';

import { useGetShowMidiEventLogPanel, useSetShowMidiEventLogPanel } from '../api/useSettings';

type MidiEventLogContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const MidiEventLogContext = createContext<MidiEventLogContextType | undefined>(undefined);

type MidiEventLogProviderProps = {
  children: React.ReactNode;
};

export function MidiEventLogProvider({ children }: MidiEventLogProviderProps) {
  const isOpen = useGetShowMidiEventLogPanel();
  const setIsOpen = useSetShowMidiEventLogPanel();

  return (
    <MidiEventLogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MidiEventLogContext.Provider>
  );
}

export function useMidiEventLogContext() {
  const context = useContext(MidiEventLogContext);
  if (!context) {
    throw new Error('useMidiEventLogContext must be used within MidiEventLogProvider');
  }
  return context;
}
