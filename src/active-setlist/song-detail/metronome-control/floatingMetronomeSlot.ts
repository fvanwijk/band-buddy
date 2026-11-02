import { createContext, useContext } from 'react';

type FloatingMetronomeSlotContextValue = {
  /** Registers the element next to the drawing tools where the floating play button is rendered */
  setToolbarSlot: (element: HTMLElement | null) => void;
};

export const FloatingMetronomeSlotContext = createContext<FloatingMetronomeSlotContextValue>({
  setToolbarSlot: () => {},
});

export const useFloatingMetronomeSlot = () => useContext(FloatingMetronomeSlotContext);
