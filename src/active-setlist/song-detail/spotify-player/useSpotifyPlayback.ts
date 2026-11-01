import { useCallback, useEffect, useRef, useState } from 'react';

import { useSpotify } from '../../../contexts/SpotifyContext';
import { loadSpotifySdk } from './loadSpotifySdk';

const PLAYER_NAME = 'BandBuddy';
const TICK_INTERVAL_MS = 250;

type PlaybackSnapshot = {
  durationMs: number | null;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  positionMs: number;
  receivedAt: number;
};

const emptySnapshot = (): PlaybackSnapshot => ({
  durationMs: null,
  isCurrentTrack: false,
  isPlaying: false,
  positionMs: 0,
  receivedAt: Date.now(),
});

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

const getErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : '';
  if (/403|forbidden|premium/i.test(message)) {
    return 'Spotify playback is not permitted. Reconnect Spotify in the settings (Premium required).';
  }
  return 'Could not control Spotify playback';
};

/**
 * Plays Spotify through the Web Playback SDK, which registers this browser as a Spotify device,
 * so playback always happens on the device BandBuddy runs on.
 */
export const useSpotifyPlayback = (spotifyId: string, fallbackDurationMs?: number) => {
  const { sdk } = useSpotify();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
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
    if (!sdk) {
      return undefined;
    }

    let isCancelled = false;
    let player: Spotify.Player | null = null;

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

        player.addListener('ready', ({ device_id }) => setDeviceId(device_id));
        player.addListener('not_ready', () => setDeviceId(null));
        player.addListener('player_state_changed', (state) => {
          setNow(Date.now());
          setSnapshot(toSnapshot(state, spotifyIdRef.current));
        });
        player.addListener('initialization_error', ({ message }) => setErrorMessage(message));
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
            setErrorMessage('Could not connect to Spotify');
          }
        });
      })
      .catch((error: unknown) => {
        console.error('Spotify player error:', error);
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Could not load Spotify');
        }
      });

    return () => {
      isCancelled = true;
      player?.disconnect();
      playerRef.current = null;
      setDeviceId(null);
    };
  }, [sdk]);

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
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }, []);

  // Starts the track on this browser's device, optionally at a given position
  const startTrack = useCallback(
    (targetMs?: number) => {
      if (!sdk || !deviceId) {
        return Promise.resolve();
      }

      return sdk.player.startResumePlayback(
        deviceId,
        undefined,
        [`spotify:track:${spotifyId}`],
        undefined,
        targetMs,
      );
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
    durationMs,
    errorMessage,
    isBusy,
    isPlaying: snapshot.isPlaying,
    isReady: deviceId !== null,
    positionMs,
    seek,
    toggle,
  };
};
