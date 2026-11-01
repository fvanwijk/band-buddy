import { useCallback, useState } from 'react';

import { isMobileBrowser } from './isMobileBrowser';
import { usePlaybackPosition } from './playbackSnapshot';
import { useSpotifyBrowserPlayback } from './useSpotifyBrowserPlayback';
import { useSpotifyRemotePlayback } from './useSpotifyRemotePlayback';

/**
 * Plays through this browser (Web Playback SDK) so music always comes from the current device.
 * Browsers that can't play Spotify remote control a chosen Spotify device instead. Mobile
 * browsers are known not to support the SDK and go straight to the fallback.
 */
export const useSpotifyPlayback = (spotifyId: string, fallbackDurationMs?: number) => {
  const [isMobile] = useState(isMobileBrowser);
  const browser = useSpotifyBrowserPlayback(spotifyId);
  const isRemote = isMobile || browser.isUnsupported;
  const remote = useSpotifyRemotePlayback(spotifyId, isRemote);
  const active = isRemote ? remote : browser;
  const { durationMs, positionMs } = usePlaybackPosition(active.snapshot, fallbackDurationMs);

  const toggle = useCallback(
    () => (isRemote ? remote.toggle(positionMs) : browser.toggle()),
    [browser, isRemote, positionMs, remote],
  );

  return {
    device: isRemote
      ? {
          devices: remote.devices,
          onRefresh: remote.refreshDevices,
          onSelect: remote.selectDevice,
          selectedId: remote.selectedDeviceId,
        }
      : null,
    durationMs,
    errorMessage: active.errorMessage,
    hint: isRemote ? remote.hint : null,
    isBusy: active.isBusy,
    isPlaying: active.snapshot.isPlaying,
    isReady: active.isReady,
    positionMs,
    seek: active.seek,
    toggle,
  };
};
