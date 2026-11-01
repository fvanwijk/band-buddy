import { useEffect, useState } from 'react';

const TICK_INTERVAL_MS = 250;

export type PlaybackSnapshot = {
  durationMs: number | null;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  positionMs: number;
  receivedAt: number;
};

export const emptySnapshot = (): PlaybackSnapshot => ({
  durationMs: null,
  isCurrentTrack: false,
  isPlaying: false,
  positionMs: 0,
  receivedAt: Date.now(),
});

// Spotify forgets a device that was idle for a moment, after which commands fail with a 404
export const isDeviceNotFoundError = (error: unknown) =>
  error instanceof Error && /device not found|no active device/i.test(error.message);

export const getPlaybackErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : '';
  if (/track unavailable/i.test(message)) {
    return "This song isn't available in your Spotify country or account, so it can't be played.";
  }
  if (/403|forbidden|premium/i.test(message)) {
    return 'Spotify playback is not permitted. Reconnect Spotify in the settings (Premium required).';
  }
  if (/non existing id|invalid base62 id/i.test(message)) {
    return "Spotify doesn't know the track ID of this song.";
  }
  if (isDeviceNotFoundError(error)) {
    return 'Spotify device not found. Open Spotify on that device and try again.';
  }
  return 'Could not control Spotify playback';
};

/**
 * Interpolates the playback position between state updates while the song is playing.
 */
export const usePlaybackPosition = (snapshot: PlaybackSnapshot, fallbackDurationMs?: number) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!snapshot.isPlaying) {
      return undefined;
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [snapshot.isPlaying]);

  const durationMs = snapshot.durationMs ?? fallbackDurationMs ?? 0;
  const elapsedMs = snapshot.isPlaying ? Math.max(0, now - snapshot.receivedAt) : 0;
  const positionMs = Math.min(snapshot.positionMs + elapsedMs, durationMs || Infinity);

  return { durationMs, positionMs };
};
