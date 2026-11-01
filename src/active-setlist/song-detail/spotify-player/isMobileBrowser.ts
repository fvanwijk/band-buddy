/**
 * Mobile browsers don't have the DRM support that Spotify's Web Playback SDK needs.
 */
export const isMobileBrowser = (): boolean => {
  const { maxTouchPoints, platform, userAgent } = navigator;
  const isTouchMac = platform === 'MacIntel' && maxTouchPoints > 1;

  return /Android|iPhone|iPad|iPod/i.test(userAgent) || isTouchMac;
};
