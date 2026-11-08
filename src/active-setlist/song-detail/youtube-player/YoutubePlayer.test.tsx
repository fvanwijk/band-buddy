import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { YoutubePlayer } from './YoutubePlayer';

type PlayerEvents = {
  onError: (event: { data: number }) => void;
  onReady: (event: { target: unknown }) => void;
  onStateChange: (event: { data: number; target: unknown }) => void;
};

describe('YoutubePlayer', () => {
  let events: PlayerEvents | null;
  let fakePlayer: Record<string, ReturnType<typeof vi.fn>>;
  let playerOptions: { videoId: string };

  const emit = <T extends keyof PlayerEvents>(name: T, event: Parameters<PlayerEvents[T]>[0]) =>
    act(() => {
      const handler = events?.[name] as ((payload: typeof event) => void) | undefined;
      handler?.(event);
    });

  const renderComponent = async () => {
    render(<YoutubePlayer durationSeconds={200} youtubeId="dQw4w9WgXcQ" />);
    await vi.waitFor(() => expect(events).not.toBeNull());
    emit('onReady', { target: fakePlayer });
  };

  beforeEach(() => {
    events = null;
    fakePlayer = {
      destroy: vi.fn(),
      getCurrentTime: vi.fn().mockReturnValue(0),
      getDuration: vi.fn().mockReturnValue(180),
      getPlayerState: vi.fn().mockReturnValue(2),
      pauseVideo: vi.fn(),
      playVideo: vi.fn(),
      seekTo: vi.fn(),
    };
    window.YT = {
      Player: vi.fn(function Player(
        _element: unknown,
        options: PlayerEvents & { videoId: string },
      ) {
        events = (options as unknown as { events: PlayerEvents }).events;
        playerOptions = options;
        return fakePlayer;
      }),
      PlayerState: { BUFFERING: 3, ENDED: 0, PAUSED: 2, PLAYING: 1 },
    } as unknown as typeof YT;
  });

  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(window, 'YT');
  });

  it('is disabled until the player is ready', async () => {
    render(<YoutubePlayer durationSeconds={200} youtubeId="dQw4w9WgXcQ" />);

    expect(screen.getByRole('button', { name: 'Play on YouTube' })).toBeDisabled();
    await vi.waitFor(() => expect(events).not.toBeNull());
  });

  it('loads the video and shows its duration', async () => {
    await renderComponent();

    expect(playerOptions.videoId).toBe('dQw4w9WgXcQ');
    expect(screen.getByText('3:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play on YouTube' })).toBeEnabled();
  });

  it('plays and pauses the video', async () => {
    const user = userEvent.setup();
    await renderComponent();

    await user.click(screen.getByRole('button', { name: 'Play on YouTube' }));
    expect(fakePlayer.playVideo).toHaveBeenCalled();

    fakePlayer.getPlayerState.mockReturnValue(1);
    emit('onStateChange', { data: 1, target: fakePlayer });
    await user.click(screen.getByRole('button', { name: 'Pause YouTube' }));

    expect(fakePlayer.pauseVideo).toHaveBeenCalled();
  });

  it('seeks with the slider', async () => {
    const user = userEvent.setup();
    await renderComponent();

    screen.getByRole('slider', { name: 'YouTube progress' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(fakePlayer.seekTo).toHaveBeenCalledWith(1, true);
  });

  it('shows an error when the video can not be played', async () => {
    await renderComponent();

    emit('onError', { data: 101 });

    expect(screen.getByRole('alert')).toHaveTextContent(/does not allow it to be played/);
  });
});
