import { useCallback, useEffect, useRef, useState } from 'react';

import { useSpotify } from '../../../contexts/SpotifyContext';
import { getPlayableTrack } from './getPlayableTrack';
import { loadSpotifySdk } from './loadSpotifySdk';
import { type PlaybackSnapshot, emptySnapshot, getPlaybackErrorMessage } from './playbackSnapshot';

const PLAYER_NAME = 'BandBuddy';
const READY_TIMEOUT_MS = 10000;

const toSnapshot = (state: Spotify.PlaybackState | null, spotifyId: string): PlaybackSnapshot => {
  const track = state?.track_window.current_track;
  // Spotify may relink a track to another market, in which case the original ID is in linked_from
  const isCurrentTrack = !!track && (track.id === spotifyId || track.linked_from.id === spotifyId);

  if (!state || !isCurrentTrack) {
    return emptySnapshot();
  }

  return {
    durationMs: state.duration,
    isCurrentTrack,
    isPlaying: !state.paused,
    positionMs: state.position,
    receivedAt: Date.now(),
  };
};

/**
 * Plays Spotify through the Web Playback SDK, which registers this browser as a Spotify device,
 * so playback happens on the device BandBuddy runs on.
 */
export const useSpotifyBrowserPlayback = (spotifyId: string, isEnabled: boolean) => {
  const { sdk } = useSpotify();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [snapshot, setSnapshot] = useState<PlaybackSnapshot>(emptySnapshot);
  const playerRef = useRef<Spotify.Player | null>(null);
  const spotifyIdRef = useRef(spotifyId);

  useEffect(() => {
    spotifyIdRef.current = spotifyId;
    setSnapshot(emptySnapshot());
    setErrorMessage(null);
    void playerRef.current?.getCurrentState().then((state) => {
      if (spotifyIdRef.current === spotifyId) {
        setSnapshot(toSnapshot(state, spotifyId));
      }
    });
  }, [spotifyId]);

  useEffect(() => {
    if (!sdk || !isEnabled) {
      return undefined;
    }

    let isCancelled = false;
    let player: Spotify.Player | null = null;
    // The SDK doesn't always report why it can't start, so give up when it never becomes ready
    const readyTimeoutId = window.setTimeout(() => setIsUnsupported(true), READY_TIMEOUT_MS);

    loadSpotifySdk()
      .then(() => {
        if (isCancelled) {
          return;
        }

        player = new window.Spotify.Player({
          getOAuthToken: (callback) => {
            void sdk.getAccessToken().then((token) => callback(token?.access_token ?? ''));
          },
          name: PLAYER_NAME,
        });

        player.addListener('ready', ({ device_id }) => {
          window.clearTimeout(readyTimeoutId);
          setDeviceId(device_id);
        });
        player.addListener('not_ready', () => setDeviceId(null));
        player.addListener('player_state_changed', (state) =>
          setSnapshot(toSnapshot(state, spotifyIdRef.current)),
        );
        // Mobile browsers lack the DRM support the SDK needs, the caller falls back to remote control
        player.addListener('initialization_error', () => setIsUnsupported(true));
        player.addListener('authentication_error', () =>
          setErrorMessage('Spotify authentication failed. Reconnect Spotify in the settings.'),
        );
        player.addListener('account_error', () =>
          setErrorMessage('Spotify Premium is required to play music in BandBuddy.'),
        );
        player.addListener('playback_error', ({ message }) => setErrorMessage(message));

        playerRef.current = player;
        return player.connect().then((isConnected) => {
          if (!isConnected && !isCancelled) {
            setIsUnsupported(true);
          }
        });
      })
      .catch(() => {
        if (!isCancelled) {
          setIsUnsupported(true);
        }
      });

    return () => {
      isCancelled = true;
      window.clearTimeout(readyTimeoutId);
      player?.disconnect();
      playerRef.current = null;
      setDeviceId(null);
    };
  }, [isEnabled, sdk]);

  const runCommand = useCallback(async (command: (player: Spotify.Player) => Promise<unknown>) => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      // Browsers only allow audio after a user gesture, so this must run from the click handler
      await player.activateElement();
      await command(player);
    } catch (error) {
      console.error('Spotify playback error:', error);
      setErrorMessage(getPlaybackErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }, []);

  // Starts the track on this browser's device, optionally at a given position
  const startTrack = useCallback(
    async (targetMs?: number) => {
      if (!sdk || !deviceId) {
        return;
      }

      const { uri } = await getPlayableTrack(sdk, spotifyId);
      await sdk.player.startResumePlayback(deviceId, undefined, [uri]);
      // The SDK's start command ignores a start position, so seek once playback has started
      if (targetMs) {
        await sdk.player.seekToPosition(targetMs, deviceId);
      }
    },
    [deviceId, sdk, spotifyId],
  );

  const toggle = useCallback(
    () =>
      runCommand((player) => {
        if (!snapshot.isCurrentTrack) {
          return startTrack();
        }

        return snapshot.isPlaying ? player.pause() : player.resume();
      }),
    [runCommand, snapshot.isCurrentTrack, snapshot.isPlaying, startTrack],
  );

  const seek = useCallback(
    (targetMs: number) =>
      runCommand((player) =>
        snapshot.isCurrentTrack ? player.seek(targetMs) : startTrack(targetMs),
      ),
    [runCommand, snapshot.isCurrentTrack, startTrack],
  );

  return {
    errorMessage,
    isBusy,
    isReady: deviceId !== null,
    isUnsupported,
    seek,
    snapshot,
    toggle,
  };
};
