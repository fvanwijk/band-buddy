import { useCallback, useEffect, useRef } from 'react';

type WakeLockSentinelLike = {
  addEventListener: (type: 'release', listener: () => void) => void;
  release: () => Promise<void>;
  removeEventListener: (type: 'release', listener: () => void) => void;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>;
  };
};

/**
 * Keep the screen awake while the app is open and visible.
 */
export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);

  const handleWakeLockRelease = useCallback(() => {
    wakeLockRef.current = null;
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (document.visibilityState !== 'visible' || wakeLockRef.current) {
      return;
    }

    const wakeLock = (navigator as WakeLockNavigator).wakeLock;
    if (!wakeLock) {
      return;
    }

    try {
      const wakeLockSentinel = await wakeLock.request('screen');
      wakeLockRef.current = wakeLockSentinel;
      wakeLockSentinel.addEventListener('release', handleWakeLockRelease);
    } catch {
      // Ignore rejections (e.g. unsupported platform restrictions).
    }
  }, [handleWakeLockRelease]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestWakeLock();
      }
    };

    void requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (!wakeLockRef.current) {
        return;
      }

      wakeLockRef.current.removeEventListener('release', handleWakeLockRelease);
      void wakeLockRef.current.release();
      wakeLockRef.current = null;
    };
  }, [handleWakeLockRelease, requestWakeLock]);
}
