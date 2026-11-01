import { useCallback, useEffect, useRef, useState } from 'react';

import { useSpotify } from '../../../contexts/SpotifyContext';
import { getPlayableTrack } from './getPlayableTrack';
import {
  type PlaybackSnapshot,
  emptySnapshot,
  getPlaybackErrorMessage,
  isDeviceNotFoundError,
} from './playbackSnapshot';
import { useSpotifyWebPlayer } from './SpotifyWebPlayerProvider';

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
 * Plays Spotify through the Web Playback SDK player of `SpotifyWebPlayerProvider`, which
 * registers this browser as a Spotify device, so playback happens on the device BandBuddy runs on.
 */
export const useSpotifyBrowserPlayback = (spotifyId: string) => {
  const { sdk } = useSpotify();
  const {
    deviceId,
    errorMessage: playerErrorMessage,
    isUnsupported,
    player,
  } = useSpotifyWebPlayer();
  const [commandErrorMessage, setCommandErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [snapshot, setSnapshot] = useState<PlaybackSnapshot>(emptySnapshot);
  const spotifyIdRef = useRef(spotifyId);

  useEffect(() => {
    if (!player) {
      return undefined;
    }

    const handleStateChange = (state: Spotify.PlaybackState | null) =>
      setSnapshot(toSnapshot(state, spotifyIdRef.current));
    player.addListener('player_state_changed', handleStateChange);

    return () => player.removeListener('player_state_changed', handleStateChange);
  }, [player]);

  // The player outlives the page, so it may already be playing something when this mounts
  useEffect(() => {
    spotifyIdRef.current = spotifyId;
    setSnapshot(emptySnapshot());
    setCommandErrorMessage(null);
    void player?.getCurrentState().then((state) => {
      if (spotifyIdRef.current === spotifyId) {
        setSnapshot(toSnapshot(state, spotifyId));
      }
    });
  }, [player, spotifyId]);

  const runCommand = useCallback(
    async (command: (activePlayer: Spotify.Player) => Promise<unknown>) => {
      if (!player) {
        return;
      }

      setIsBusy(true);
      setCommandErrorMessage(null);

      try {
        // Browsers only allow audio after a user gesture, so this must run from the click handler
        await player.activateElement();
        await command(player);
      } catch (error) {
        console.error('Spotify playback error:', error);
        setCommandErrorMessage(getPlaybackErrorMessage(error));
      } finally {
        setIsBusy(false);
      }
    },
    [player],
  );

  // Starts the track on this browser's device, optionally at a given position
  const startTrack = useCallback(
    async (targetMs?: number) => {
      if (!sdk || !deviceId) {
        return;
      }

      const { uri } = await getPlayableTrack(sdk, spotifyId);
      try {
        await sdk.player.startResumePlayback(deviceId, undefined, [uri]);
      } catch (error) {
        if (!isDeviceNotFoundError(error)) {
          throw error;
        }
        // This browser's device went idle, so make it the active device again and retry
        await sdk.player.transferPlayback([deviceId], false);
        await sdk.player.startResumePlayback(deviceId, undefined, [uri]);
      }
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
    errorMessage: commandErrorMessage ?? playerErrorMessage,
    isBusy,
    isReady: deviceId !== null,
    isUnsupported,
    seek,
    snapshot,
    toggle,
  };
};
