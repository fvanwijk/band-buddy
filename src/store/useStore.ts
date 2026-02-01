import { useContext } from 'react';

import { StoreContext } from './StoreProvider';
import type { Setlist, Song } from '../types';

export function useSetlists(): Setlist[] {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useSetlists must be used within StoreProvider');
  }
  return context.setlists;
}

export function useSongs(): Song[] {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useSongs must be used within StoreProvider');
  }
  return context.songs;
}
