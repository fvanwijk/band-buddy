import type { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { StoreProvider } from '../../../store/StoreProvider';
import { MockSpotifyProvider } from '../../../testUtils';
import { SpotifyPlayer } from './SpotifyPlayer';
import { SpotifyWebPlayerProvider } from './SpotifyWebPlayerProvider';

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
      seekToPosition: vi.fn().mockResolvedValue(undefined),
      startResumePlayback: vi.fn().mockResolvedValue(undefined),
      transferPlayback: vi.fn().mockResolvedValue(undefined),
    };

    render(
      <MockSpotifyProvider
        sdk={
          {
            getAccessToken: vi.fn().mockResolvedValue({ access_token: 'token' }),
            player,
            tracks: {
              get: vi.fn().mockResolvedValue({
                album: { uri: 'spotify:album:album1' },
                is_playable: true,
                uri: 'spotify:track:abc123',
              }),
            },
          } as unknown as SpotifyApi
        }
      >
        <SpotifyWebPlayerProvider isEnabled>
          <SpotifyPlayer durationSeconds={200} spotifyId="abc123" />
        </SpotifyWebPlayerProvider>
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
      getVolume: vi.fn().mockResolvedValue(0.5),
      pause: vi.fn().mockResolvedValue(undefined),
      removeListener: vi.fn(),
      resume: vi.fn().mockResolvedValue(undefined),
      seek: vi.fn().mockResolvedValue(undefined),
      setVolume: vi.fn().mockResolvedValue(undefined),
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
        <SpotifyWebPlayerProvider isEnabled>
          <SpotifyPlayer durationSeconds={200} spotifyId="abc123" />
        </SpotifyWebPlayerProvider>
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

  it('shows the volume of the browser player and changes it with the slider', async () => {
    const user = userEvent.setup();
    await renderComponent();

    await user.hover(await screen.findByRole('button', { name: 'Mute Spotify' }));
    const slider = await screen.findByRole('slider', { name: 'Spotify volume' });
    expect(slider).toHaveAttribute('aria-valuenow', '50');

    slider.focus();
    await user.keyboard('{ArrowUp}');

    expect(fakePlayer.setVolume).toHaveBeenCalledWith(0.51);
  });

  it('starts the track on this browser instead of another Spotify device', async () => {
    const user = userEvent.setup();
    const player = await renderComponent();

    await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

    expect(fakePlayer.activateElement).toHaveBeenCalled();
    expect(player.startResumePlayback).toHaveBeenCalledWith('browser-device', undefined, [
      'spotify:track:abc123',
    ]);
  });

  it('makes this browser the active device again when Spotify forgot it', async () => {
    const user = userEvent.setup();
    const player = await renderComponent();
    player.startResumePlayback.mockRejectedValueOnce(
      new Error('404 Player command failed: Device not found'),
    );

    await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

    await vi.waitFor(() => expect(player.startResumePlayback).toHaveBeenCalledTimes(2));
    expect(player.transferPlayback).toHaveBeenCalledWith(['browser-device'], false);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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

    expect(player.startResumePlayback).toHaveBeenCalledWith('browser-device', undefined, [
      'spotify:track:abc123',
    ]);
    expect(player.seekToPosition).toHaveBeenCalledWith(1000, 'browser-device');
  });

  it('shows errors reported by the player', async () => {
    await renderComponent();
    emit('account_error', { message: 'premium' });

    expect(await screen.findByRole('alert')).toHaveTextContent('Premium is required');
  });

  it('keeps the same player and device when the player is remounted for another song', async () => {
    const user = userEvent.setup();
    const sdk = {
      getAccessToken: vi.fn().mockResolvedValue({ access_token: 'token' }),
      player: { startResumePlayback: vi.fn().mockResolvedValue(undefined) },
      tracks: {
        get: vi.fn().mockResolvedValue({
          album: { uri: 'spotify:album:album1' },
          is_playable: true,
          uri: 'spotify:track:next',
        }),
      },
    } as unknown as SpotifyApi;
    const renderTree = (spotifyId: string) => (
      <MockSpotifyProvider sdk={sdk}>
        <SpotifyWebPlayerProvider isEnabled>
          <SpotifyPlayer durationSeconds={200} key={spotifyId} spotifyId={spotifyId} />
        </SpotifyWebPlayerProvider>
      </MockSpotifyProvider>
    );
    const { rerender } = render(renderTree('abc123'));
    await vi.waitFor(() => expect(listeners.ready).toBeDefined());
    emit('ready', { device_id: 'browser-device' });

    rerender(renderTree('next'));
    await user.click(await screen.findByRole('button', { name: 'Play on Spotify' }));

    expect(window.Spotify.Player).toHaveBeenCalledTimes(1);
    expect(fakePlayer.disconnect).not.toHaveBeenCalled();
    expect(sdk.player.startResumePlayback).toHaveBeenCalledWith('browser-device', undefined, [
      'spotify:track:next',
    ]);
  });

  it('disconnects the player when unmounted', async () => {
    await renderComponent();

    cleanup();

    expect(fakePlayer.disconnect).toHaveBeenCalled();
  });

  describe('when the browser cannot play Spotify', () => {
    const renderRemote = async (
      overrides: {
        devices?: unknown[];
        isPlayable?: boolean;
        playbackState?: unknown;
        selectedDeviceId?: string;
        trackUri?: string;
      } = {},
    ) => {
      const {
        devices = [],
        isPlayable = true,
        playbackState = null,
        selectedDeviceId,
        trackUri = 'spotify:track:abc123',
      } = overrides;
      if (selectedDeviceId) {
        localStorage.setItem('band-buddy-spotify-device-id', selectedDeviceId);
      }

      const tracks = {
        get: vi.fn().mockResolvedValue({
          album: { uri: 'spotify:album:album1' },
          is_playable: isPlayable,
          uri: trackUri,
        }),
      };
      const player = {
        getAvailableDevices: vi.fn().mockResolvedValue({ devices }),
        getPlaybackState: vi.fn().mockResolvedValue(playbackState),
        pausePlayback: vi.fn().mockResolvedValue(undefined),
        seekToPosition: vi.fn().mockResolvedValue(undefined),
        startResumePlayback: vi.fn().mockResolvedValue(undefined),
        transferPlayback: vi.fn().mockResolvedValue(undefined),
      };

      render(
        <StoreProvider>
          <MockSpotifyProvider
            sdk={
              {
                getAccessToken: vi.fn().mockResolvedValue({ access_token: 'token' }),
                player,
                tracks,
              } as unknown as SpotifyApi
            }
          >
            <SpotifyWebPlayerProvider isEnabled>
              <SpotifyPlayer durationSeconds={200} spotifyId="abc123" />
            </SpotifyWebPlayerProvider>
          </MockSpotifyProvider>
        </StoreProvider>,
      );

      await vi.waitFor(() => expect(listeners.initialization_error).toBeDefined());
      emit('initialization_error', { message: 'Failed to initialize player' });

      return player;
    };

    const phone = { id: 'phone', is_active: false, name: 'Pixel', type: 'Smartphone' };
    const speaker = { id: 'speaker', is_active: true, name: 'Kitchen', type: 'Speaker' };

    it('lists the devices in a menu and does not show the SDK error', async () => {
      const user = userEvent.setup();
      await renderRemote({ devices: [phone, speaker] });

      await user.click(screen.getByRole('button', { name: 'Choose Spotify device' }));

      expect(await screen.findByRole('menuitem', { name: /Pixel/ })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Kitchen/ })).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('explains how to get a device when none are found', async () => {
      const user = userEvent.setup();
      await renderRemote();

      await user.click(screen.getByRole('button', { name: 'Choose Spotify device' }));

      expect(await screen.findByText(/No devices found/)).toBeInTheDocument();
    });

    it('plays on the chosen device instead of the active one', async () => {
      const user = userEvent.setup();
      const player = await renderRemote({ devices: [phone, speaker], selectedDeviceId: 'phone' });

      await vi.waitFor(() =>
        expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

      await vi.waitFor(() =>
        expect(player.startResumePlayback).toHaveBeenCalledWith(
          'phone',
          'spotify:album:album1',
          undefined,
          { uri: 'spotify:track:abc123' },
        ),
      );
    });

    it('wakes an inactive device before starting the track', async () => {
      const user = userEvent.setup();
      const player = await renderRemote({ devices: [phone, speaker], selectedDeviceId: 'phone' });

      await vi.waitFor(() =>
        expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

      await vi.waitFor(() =>
        expect(player.transferPlayback).toHaveBeenCalledWith(['phone'], false),
      );
    });

    it('never falls back to another device when the chosen one is offline', async () => {
      const player = await renderRemote({ devices: [speaker], selectedDeviceId: 'phone' });

      await vi.waitFor(() => expect(player.getAvailableDevices).toHaveBeenCalled());

      expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeDisabled();
    });

    it('stores the chosen device and plays on it', async () => {
      const user = userEvent.setup();
      const player = await renderRemote({ devices: [phone, speaker] });

      await user.click(screen.getByRole('button', { name: 'Choose Spotify device' }));
      await user.click(await screen.findByRole('menuitem', { name: /Pixel/ }));
      await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

      await vi.waitFor(() =>
        expect(player.startResumePlayback).toHaveBeenCalledWith(
          'phone',
          'spotify:album:album1',
          undefined,
          { uri: 'spotify:track:abc123' },
        ),
      );
      expect(localStorage.getItem('band-buddy-spotify-device-id')).toBe('phone');
      expect(localStorage.getItem('band-buddy') ?? '').not.toContain('phone');
    });

    it('does not play when no device is chosen or active', async () => {
      const player = await renderRemote({ devices: [{ ...phone }] });

      await vi.waitFor(() => expect(player.getAvailableDevices).toHaveBeenCalled());

      expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeDisabled();
    });

    it('pauses and seeks the current track on the chosen device', async () => {
      const user = userEvent.setup();
      const player = await renderRemote({
        devices: [phone],
        playbackState: {
          device: { id: 'phone' },
          is_playing: true,
          item: { duration_ms: 200000, id: 'abc123' },
          progress_ms: 60000,
        },
        selectedDeviceId: 'phone',
      });

      await user.click(await screen.findByRole('button', { name: 'Pause Spotify' }));
      await vi.waitFor(() => expect(player.pausePlayback).toHaveBeenCalledWith('phone'));

      act(() => screen.getByRole('slider', { name: 'Song progress' }).focus());
      await user.keyboard('{ArrowRight}');
      await vi.waitFor(() => expect(player.seekToPosition).toHaveBeenCalledWith(61000, 'phone'));
    });

    it('shows no progress or play state while Spotify plays another song', async () => {
      await renderRemote({
        devices: [{ ...phone, is_active: true }],
        playbackState: {
          device: { id: 'phone' },
          is_playing: true,
          item: { duration_ms: 90000, id: 'other-song' },
          progress_ms: 45000,
        },
        selectedDeviceId: 'phone',
      });

      await vi.waitFor(() =>
        expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeEnabled(),
      );

      expect(screen.getByText('0:00')).toBeInTheDocument();
      expect(screen.getByText('3:20')).toBeInTheDocument();
      expect(screen.queryByText('0:45')).not.toBeInTheDocument();
    });

    it('starts this song when Spotify plays another one', async () => {
      const user = userEvent.setup();
      const player = await renderRemote({
        devices: [{ ...phone, is_active: true }],
        playbackState: {
          device: { id: 'phone' },
          is_playing: true,
          item: { duration_ms: 90000, id: 'other-song' },
          progress_ms: 45000,
        },
        selectedDeviceId: 'phone',
      });

      await vi.waitFor(() =>
        expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

      await vi.waitFor(() =>
        expect(player.startResumePlayback).toHaveBeenCalledWith(
          'phone',
          'spotify:album:album1',
          undefined,
          { uri: 'spotify:track:abc123' },
        ),
      );
      expect(await screen.findByRole('button', { name: 'Pause Spotify' })).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('explains that the chosen device is offline', async () => {
      await renderRemote({ devices: [speaker], selectedDeviceId: 'phone' });

      expect(await screen.findByText(/selected Spotify device is offline/)).toBeInTheDocument();
    });

    it('explains when the song is not available instead of sending a play command', async () => {
      const user = userEvent.setup();
      const player = await renderRemote({
        devices: [{ ...phone, is_active: true }],
        isPlayable: false,
        selectedDeviceId: 'phone',
      });

      await vi.waitFor(() =>
        expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

      expect(await screen.findByRole('alert')).toHaveTextContent("isn't available in your Spotify");
      expect(player.startResumePlayback).not.toHaveBeenCalled();
    });

    it('starts the song inside its album without a transfer when the device is active', async () => {
      const user = userEvent.setup();
      const player = await renderRemote({
        devices: [{ ...phone, is_active: true }],
        playbackState: {
          device: { id: 'phone' },
          is_playing: true,
          item: { duration_ms: 90000, id: 'other-song' },
          progress_ms: 45000,
        },
        selectedDeviceId: 'phone',
      });

      await vi.waitFor(() =>
        expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

      await vi.waitFor(() => expect(player.startResumePlayback).toHaveBeenCalled());
      expect(player.transferPlayback).not.toHaveBeenCalled();
    });

    it('pauses at the end of the song instead of playing the next album track', async () => {
      const user = userEvent.setup();
      const player = await renderRemote({
        devices: [{ ...phone, is_active: true }],
        selectedDeviceId: 'phone',
      });
      await vi.waitFor(() =>
        expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeEnabled(),
      );
      player.getPlaybackState.mockResolvedValue({
        device: { id: 'phone' },
        is_playing: true,
        item: { duration_ms: 200000, id: 'abc123' },
        progress_ms: 199800,
      });

      await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

      await vi.waitFor(() => expect(player.pausePlayback).toHaveBeenCalledWith('phone'), {
        timeout: 5000,
      });
    });

    it('wakes the device and retries when Spotify reports it as not found', async () => {
      const user = userEvent.setup();
      const player = await renderRemote({
        devices: [{ ...phone, is_active: true }],
        selectedDeviceId: 'phone',
      });
      player.startResumePlayback.mockRejectedValueOnce(
        new Error('404 Player command failed: Device not found'),
      );

      await vi.waitFor(() =>
        expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

      await vi.waitFor(() => expect(player.startResumePlayback).toHaveBeenCalledTimes(2));
      expect(player.transferPlayback).toHaveBeenCalledWith(['phone'], false);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('plays the URI Spotify relinks the track to in the user market', async () => {
      const user = userEvent.setup();
      const player = await renderRemote({
        devices: [{ ...phone, is_active: true }],
        selectedDeviceId: 'phone',
        trackUri: 'spotify:track:relinked',
      });

      await vi.waitFor(() =>
        expect(screen.getByRole('button', { name: 'Play on Spotify' })).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: 'Play on Spotify' }));

      await vi.waitFor(() =>
        expect(player.startResumePlayback).toHaveBeenCalledWith(
          'phone',
          'spotify:album:album1',
          undefined,
          { uri: 'spotify:track:relinked' },
        ),
      );
    });
  });
});
