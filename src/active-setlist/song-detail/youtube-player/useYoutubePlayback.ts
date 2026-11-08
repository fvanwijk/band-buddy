import { useCallback, useEffect, useRef, useState } from 'react';

import { loadYoutubeIframeApi } from './loadYoutubeIframeApi';

const POLL_INTERVAL_MS = 250;

const getErrorMessage = (code: number) => {
  switch (code) {
    case 2:
      return "YouTube doesn't know the video ID of this song.";
    case 100:
      return 'This YouTube video is not available.';
    case 101:
    case 150:
      return 'The owner of this YouTube video does not allow it to be played here.';
    default:
      return 'Could not play this YouTube video.';
  }
};

/**
 * Controls a hidden YouTube IFrame player, so only the audio of the video is played.
 * Attach `containerRef` to an (invisible) element that hosts the iframe.
 */
export const useYoutubePlayback = (youtubeId: string, fallbackDurationMs?: number) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const [durationMs, setDurationMs] = useState(fallbackDurationMs ?? 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [positionMs, setPositionMs] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    let isCancelled = false;
    setErrorMessage(null);
    setIsPlaying(false);
    setIsReady(false);
    setPositionMs(0);

    const syncDuration = (player: YT.Player) => {
      const seconds = player.getDuration();
      if (seconds > 0) {
        setDurationMs(seconds * 1000);
      }
    };

    loadYoutubeIframeApi()
      .then((api) => {
        if (isCancelled) {
          return;
        }

        // The API replaces the element it is given, so it gets its own child that React doesn't manage
        const target = document.createElement('div');
        container.appendChild(target);

        playerRef.current = new api.Player(target, {
          events: {
            onError: (event) => setErrorMessage(getErrorMessage(event.data)),
            onReady: (event) => {
              syncDuration(event.target);
              setIsReady(true);
            },
            onStateChange: (event) => {
              setIsPlaying(
                event.data === api.PlayerState.PLAYING || event.data === api.PlayerState.BUFFERING,
              );
              syncDuration(event.target);
              setPositionMs(event.target.getCurrentTime() * 1000);
            },
          },
          height: '1',
          playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
          videoId: youtubeId,
          width: '1',
        });
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Could not load YouTube');
        }
      });

    return () => {
      isCancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      container.replaceChildren();
    };
  }, [youtubeId]);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const player = playerRef.current;
      if (player) {
        setPositionMs(player.getCurrentTime() * 1000);
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isPlaying]);

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    setErrorMessage(null);
    if (player.getPlayerState() === window.YT?.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, []);

  const seek = useCallback((ms: number) => {
    playerRef.current?.seekTo(ms / 1000, true);
    setPositionMs(ms);
  }, []);

  return { containerRef, durationMs, errorMessage, isPlaying, isReady, positionMs, seek, toggle };
};
