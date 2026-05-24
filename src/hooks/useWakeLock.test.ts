import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';

import { useWakeLock } from './useWakeLock';

type WakeLockSentinelMock = {
  addEventListener: ReturnType<typeof vi.fn>;
  release: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
};

const createSentinel = (): WakeLockSentinelMock => ({
  addEventListener: vi.fn(),
  release: vi.fn().mockResolvedValue(undefined),
  removeEventListener: vi.fn(),
});

const setVisibilityState = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: state,
  });
};

describe('useWakeLock', () => {
  it('requests a screen wake lock on mount when supported', async () => {
    setVisibilityState('visible');
    const sentinel = createSentinel();
    const request = vi.fn().mockResolvedValue(sentinel);

    Object.defineProperty(window.navigator, 'wakeLock', {
      configurable: true,
      value: { request },
    });

    renderHook(() => useWakeLock());

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith('screen');
    });
  });

  it('does not throw when wake lock API is unavailable', () => {
    Object.defineProperty(window.navigator, 'wakeLock', {
      configurable: true,
      value: undefined,
    });

    expect(() => renderHook(() => useWakeLock())).not.toThrow();
  });

  it('requests again when returning to visible state', async () => {
    setVisibilityState('visible');
    let releaseListener: (() => void) | undefined;
    const firstSentinel = createSentinel();
    firstSentinel.addEventListener.mockImplementation((_, listener) => {
      releaseListener = listener;
    });

    const request = vi
      .fn()
      .mockResolvedValueOnce(firstSentinel)
      .mockResolvedValueOnce(createSentinel());

    Object.defineProperty(window.navigator, 'wakeLock', {
      configurable: true,
      value: { request },
    });

    renderHook(() => useWakeLock());

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(1);
    });

    setVisibilityState('hidden');
    document.dispatchEvent(new Event('visibilitychange'));

    releaseListener?.();

    setVisibilityState('visible');
    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(2);
    });
  });
});
