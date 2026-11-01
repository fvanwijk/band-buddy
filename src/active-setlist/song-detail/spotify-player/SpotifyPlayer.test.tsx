import type { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { MockSpotifyProvider } from '../../../testUtils';
import { SpotifyPlayer } from './SpotifyPlayer';

type Listener = (payload: unknown) => void;

describe('SpotifyPlayer', () => {
  let listeners: Record<string, Listener>;
  let fakePlayer: Record<string, ReturnType<typeof vi.fn>>;

  const emit = (event: string, payload?: unknown) => act(() => listeners[event](payload));

  const createState = (overrides: Record<string, unknown> = {}) => ({
    duration: 200000,
    paused: true,
    position: 60000,
    track_window: { current_track: { id: 'abc123', linked_from: { id: null } } },
    ...overrides,
  });

  const renderComponent = async () => {
    const player = {
      startResumePlayback: vi.fn().mockResolvedValue(undefined),
    };

    render(
      <MockSpotifyProvider
        sdk={
          {
            getAccessToken: vi.fn().mockResolvedValue({ access_token: 'token' }),
            player,
          } as unknown as SpotifyApi
        }
      >
        <SpotifyPlayer durationSeconds={200} spotifyId="abc123" />
      </MockSpotifyProvider>,
    );

    await vi.waitFor(() => expect(listeners.ready).toBeDefined());
    emit('ready', { device_id: 'browser-device' });

    return player;
  };

  beforeEach(() => {
    listeners = {};
    fakePlayer = {
      activateElement: vi.fn().mockResolvedValue(undefined),
      connect: vi.fn().mockResolvedValue(true),
      disconnect: vi.fn(),
      getCurrentState: vi.fn().mockResolvedValue(null),
      pause: vi.fn().mockResolvedValue(undefined),
      resume: vi.fn().mockResolvedValue(undefined),
      seek: vi.fn().mockResolvedValue(undefined),
    };
    fakePlayer.addListener = vi.fn((event: string, listener: Listener) => {
      listeners[event] = listener;
      return true;
    });

    window.Spotify = {
      Player: vi.fn(function Player() {
        return fakePlayer;
      }),
    } as unknown as typeof Spotify;
  });

  afterEach(() => {
    delete (window as { Spotify?: unknown }).Spotify;
  });

  it('is disabled until the browser device is ready', async () => {
    render(
      <MockSpotifyProvider sdk={{ getAccessToken: vi.fn() } as unknown as SpotifyApi}>
        <SpotifyPlayer durationSeconds={200} spotifyId="abc123" />
      </MockSpotifyProvider>,
    );

    expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeDisabled();
    await vi.waitFor(() => expect(listeners.ready).toBeDefined());
  });

  it('shows the song duration before anything is playing', async () => {
    await renderComponent();

    expect(screen.getByText('3:20')).toBeInTheDocument();
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('starts the track on this browser instead of another Spotify device', async () => {
    const user = userEvent.setup();
    const player = await renderComponent();

    await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

    expect(fakePlayer.activateElement).toHaveBeenCalled();
    expect(player.startResumePlayback).toHaveBeenCalledWith(
      'browser-device',
      undefined,
      ['spotify:track:abc123'],
      undefined,
      undefined,
    );
  });

  it('shows the progress of the playing track and pauses it', async () => {
    const user = userEvent.setup();
    await renderComponent();
    emit('player_state_changed', createState({ paused: false }));

    expect(screen.getByText('1:00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Pause Spotify' }));

    expect(fakePlayer.pause).toHaveBeenCalled();
  });

  it('resumes the loaded track without restarting it', async () => {
    const user = userEvent.setup();
    const player = await renderComponent();
    emit('player_state_changed', createState());

    await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

    expect(fakePlayer.resume).toHaveBeenCalled();
    expect(player.startResumePlayback).not.toHaveBeenCalled();
  });

  it('ignores playback of another track', async () => {
    await renderComponent();
    emit(
      'player_state_changed',
      createState({
        paused: false,
        track_window: { current_track: { id: 'other', linked_from: { id: null } } },
      }),
    );

    expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeInTheDocument();
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('seeks within the loaded track', async () => {
    const user = userEvent.setup();
    await renderComponent();
    emit('player_state_changed', createState());

    act(() => screen.getByRole('slider', { name: 'Song progress' }).focus());
    await user.keyboard('{ArrowRight}');

    expect(fakePlayer.seek).toHaveBeenCalledWith(61000);
  });

  it('starts the track at the chosen position when it is not loaded', async () => {
    const user = userEvent.setup();
    const player = await renderComponent();

    act(() => screen.getByRole('slider', { name: 'Song progress' }).focus());
    await user.keyboard('{ArrowRight}');

    expect(player.startResumePlayback).toHaveBeenCalledWith(
      'browser-device',
      undefined,
      ['spotify:track:abc123'],
      undefined,
      1000,
    );
  });

  it('shows errors reported by the player', async () => {
    await renderComponent();
    emit('account_error', { message: 'premium' });

    expect(await screen.findByRole('alert')).toHaveTextContent('Premium is required');
  });

  it('disconnects the player when unmounted', async () => {
    await renderComponent();

    cleanup();

    expect(fakePlayer.disconnect).toHaveBeenCalled();
  });
});
