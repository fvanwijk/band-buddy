import type { Device, PlaybackState, SpotifyApi } from '@spotify/web-api-ts-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useSpotify } from '../../../contexts/SpotifyContext';
import { getPlayableTrack } from './getPlayableTrack';
import { type PlaybackSnapshot, emptySnapshot, getPlaybackErrorMessage } from './playbackSnapshot';
import { useSpotifyDeviceId } from './useSpotifyDeviceId';

const POLL_INTERVAL_MS = 3000;
// Polls faster while waiting for Spotify to report that a started song is playing
const AWAITING_POLL_INTERVAL_MS = 1000;
// Spotify reports stale state for a moment after a command, so ignore polls right after one
const SETTLE_TIME_MS = 1000;
// Waking up a sleeping Spotify app can take a few seconds
const PLAYBACK_START_TIMEOUT_MS = 10000;
const WAKE_UP_DELAY_MS = 500;
// Songs are started inside their album, so playback is stopped just before it moves on to the
// next album track
const END_OF_SONG_MARGIN_MS = 300;
// A song that is paused this close to its end is started again instead of resumed
const FINISHED_THRESHOLD_MS = 1500;

const toSnapshot = (
  state: PlaybackState | null | undefined,
  spotifyId: string,
  deviceId: string | null,
): PlaybackSnapshot => {
  const item = state?.item;
  // Spotify may relink a track to another market, in which case the original ID is in linked_from
  const isCurrentTrack =
    !!item &&
    (item.id === spotifyId || ('linked_from' in item && item.linked_from?.id === spotifyId));
  const isOnTargetDevice = !deviceId || state?.device?.id === deviceId;

  // Anything Spotify plays other than this song is not reflected in the player
  if (!state || !item || !isCurrentTrack || !isOnTargetDevice) {
    return emptySnapshot();
  }

  return {
    durationMs: item.duration_ms,
    isCurrentTrack,
    isPlaying: state.is_playing,
    positionMs: state.progress_ms,
    receivedAt: Date.now(),
  };
};

const fetchDevices = async (sdk: SpotifyApi) => {
  const { devices } = await sdk.player.getAvailableDevices();
  return devices.filter((device) => !!device.id && !device.is_restricted);
};

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/**
 * Remote controls the Spotify app on one of the user's devices through the Web API. Used when
 * the browser can't play music itself, like mobile browsers.
 */
export const useSpotifyRemotePlayback = (spotifyId: string, isEnabled: boolean) => {
  const { sdk } = useSpotify();
  const [selectedDeviceId, setSelectedDeviceId] = useSpotifyDeviceId();
  const [devices, setDevices] = useState<Device[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedDevices, setHasLoadedDevices] = useState(false);
  const [isAwaitingPlayback, setIsAwaitingPlayback] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [snapshot, setSnapshot] = useState<PlaybackSnapshot>(emptySnapshot);
  const awaitingDeadlineRef = useRef<number | null>(null);
  const ignorePollsUntilRef = useRef(0);
  const isInAlbumContextRef = useRef(false);

  // Only the device chosen by the user, or without a choice the one Spotify considers active,
  // is ever controlled. A chosen device that is offline is never replaced by another one.
  const targetDevice = selectedDeviceId
    ? devices.find((device) => device.id === selectedDeviceId)
    : devices.find((device) => device.is_active);
  const targetDeviceId = targetDevice?.id ?? null;
  const isReady = targetDeviceId !== null;

  const stopAwaitingPlayback = useCallback(() => {
    awaitingDeadlineRef.current = null;
    setIsAwaitingPlayback(false);
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!sdk || !isEnabled) {
      return;
    }

    try {
      setDevices(await fetchDevices(sdk));
      setHasLoadedDevices(true);
    } catch {
      // The next poll tries again
    }
  }, [isEnabled, sdk]);

  const refreshState = useCallback(async () => {
    if (!sdk || !isEnabled || document.hidden) {
      return;
    }

    try {
      const [state, available] = await Promise.all([
        sdk.player.getPlaybackState(),
        fetchDevices(sdk),
      ]);
      setDevices(available);
      setHasLoadedDevices(true);
      if (Date.now() < ignorePollsUntilRef.current) {
        return;
      }

      const next = toSnapshot(state, spotifyId, targetDeviceId);
      const deadline = awaitingDeadlineRef.current;
      if (deadline !== null) {
        if (next.isPlaying) {
          stopAwaitingPlayback();
        } else if (Date.now() < deadline) {
          // Spotify still reports the previous state, keep showing the requested one
          return;
        } else {
          stopAwaitingPlayback();
          setErrorMessage(
            "Spotify didn't start playing on that device. Open the Spotify app on it, start any song once and try again.",
          );
        }
      }

      setSnapshot(next);
    } catch {
      // The next poll tries again
    }
  }, [isEnabled, sdk, spotifyId, stopAwaitingPlayback, targetDeviceId]);

  useEffect(() => {
    setErrorMessage(null);
    setSnapshot(emptySnapshot());
    stopAwaitingPlayback();
    isInAlbumContextRef.current = false;
  }, [isEnabled, spotifyId, stopAwaitingPlayback]);

  // Stops at the end of the song instead of continuing with the next track of the album
  useEffect(() => {
    if (
      !sdk ||
      !targetDeviceId ||
      !snapshot.isPlaying ||
      !snapshot.durationMs ||
      !isInAlbumContextRef.current
    ) {
      return undefined;
    }

    const remainingMs =
      snapshot.durationMs - snapshot.positionMs - (Date.now() - snapshot.receivedAt);
    const timeoutId = window.setTimeout(
      () => {
        void sdk.player.pausePlayback(targetDeviceId).catch(() => undefined);
        setSnapshot((current) => ({
          ...current,
          isPlaying: false,
          positionMs: current.durationMs ?? current.positionMs,
          receivedAt: Date.now(),
        }));
      },
      Math.max(0, remainingMs - END_OF_SONG_MARGIN_MS),
    );

    return () => window.clearTimeout(timeoutId);
  }, [sdk, snapshot, targetDeviceId]);

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    void refreshState();
    const intervalId = window.setInterval(
      () => void refreshState(),
      isAwaitingPlayback ? AWAITING_POLL_INTERVAL_MS : POLL_INTERVAL_MS,
    );
    // Catch up immediately when returning from the Spotify app
    const handleVisibilityChange = () => void refreshState();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAwaitingPlayback, isEnabled, refreshState]);

  const runCommand = useCallback(
    async (command: (deviceId: string) => Promise<unknown>, next: Partial<PlaybackSnapshot>) => {
      if (!targetDeviceId) {
        setErrorMessage('Choose the Spotify device to play on.');
        return;
      }

      setIsBusy(true);
      setErrorMessage(null);

      try {
        // A device that is not active yet, like a sleeping app, must be woken up first
        if (!targetDevice?.is_active) {
          await sdk?.player.transferPlayback([targetDeviceId], false);
          await sleep(WAKE_UP_DELAY_MS);
        }
        await command(targetDeviceId);
        ignorePollsUntilRef.current = Date.now() + SETTLE_TIME_MS;
        setSnapshot((current) => ({ ...current, ...next, receivedAt: Date.now() }));

        if (next.isPlaying) {
          awaitingDeadlineRef.current = Date.now() + PLAYBACK_START_TIMEOUT_MS;
          setIsAwaitingPlayback(true);
        } else {
          stopAwaitingPlayback();
        }
      } catch (error) {
        console.error('Spotify playback error:', error);
        setErrorMessage(getPlaybackErrorMessage(error));
      } finally {
        setIsBusy(false);
      }
    },
    [sdk, stopAwaitingPlayback, targetDevice?.is_active, targetDeviceId],
  );

  const startTrack = useCallback(
    async (deviceId: string, targetMs?: number) => {
      if (!sdk) {
        return;
      }

      const { albumUri, uri } = await getPlayableTrack(sdk, spotifyId);
      // Spotify devices don't reliably start a song that is sent on its own while another song is
      // loaded, but starting it inside its album does work
      await sdk.player.startResumePlayback(deviceId, albumUri, undefined, { uri });
      isInAlbumContextRef.current = true;
      // The SDK's start command ignores a start position, so seek once playback has started
      if (targetMs) {
        await sdk.player.seekToPosition(targetMs, deviceId);
      }
    },
    [sdk, spotifyId],
  );

  const toggle = useCallback(
    (positionMs: number) => {
      // A song that already reached its end is started over instead of resumed
      const isFinished =
        snapshot.isCurrentTrack &&
        !!snapshot.durationMs &&
        positionMs >= snapshot.durationMs - FINISHED_THRESHOLD_MS;
      const shouldStartTrack = !snapshot.isCurrentTrack || isFinished;

      return runCommand(
        async (deviceId) => {
          if (snapshot.isPlaying) {
            await sdk?.player.pausePlayback(deviceId);
            return;
          }

          if (shouldStartTrack) {
            await startTrack(deviceId);
            return;
          }

          await sdk?.player.startResumePlayback(deviceId);
        },
        snapshot.isPlaying
          ? { isPlaying: false, positionMs }
          : {
              isCurrentTrack: true,
              isPlaying: true,
              positionMs: shouldStartTrack ? 0 : positionMs,
            },
      );
    },
    [runCommand, sdk, snapshot.durationMs, snapshot.isCurrentTrack, snapshot.isPlaying, startTrack],
  );

  const seek = useCallback(
    (targetMs: number) =>
      runCommand(
        (deviceId) =>
          snapshot.isCurrentTrack
            ? (sdk?.player.seekToPosition(targetMs, deviceId) ?? Promise.resolve())
            : startTrack(deviceId, targetMs),
        snapshot.isCurrentTrack
          ? { positionMs: targetMs }
          : { isCurrentTrack: true, isPlaying: true, positionMs: targetMs },
      ),
    [runCommand, sdk, snapshot.isCurrentTrack, startTrack],
  );

  let hint: string | null = null;
  if (!isReady && hasLoadedDevices) {
    hint = selectedDeviceId
      ? 'The selected Spotify device is offline. Open Spotify on it to continue.'
      : 'Open Spotify on a device and choose it with the device button.';
  }

  return {
    devices,
    errorMessage,
    hint,
    isBusy,
    isReady,
    refreshDevices,
    seek,
    selectDevice: setSelectedDeviceId,
    selectedDeviceId: targetDeviceId ?? '',
    snapshot,
    toggle,
  };
};
