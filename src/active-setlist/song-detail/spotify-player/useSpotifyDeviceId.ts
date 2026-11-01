import { useCallback, useSyncExternalStore } from 'react';

// The device is specific to this browser, so it lives outside the store that backups are made of
const STORAGE_KEY = 'band-buddy-spotify-device-id';

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener('storage', listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
};

const getSnapshot = () => localStorage.getItem(STORAGE_KEY) ?? '';

/**
 * The Spotify device that is remote controlled, remembered on this device only.
 */
export const useSpotifyDeviceId = () => {
  const deviceId = useSyncExternalStore(subscribe, getSnapshot);

  const setDeviceId = useCallback((id: string) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [deviceId, setDeviceId] as const;
};
