import { IconUpload } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { parse } from 'spotify-uri';
import type { Row } from 'tinybase';
import { useStore } from 'tinybase/ui-react';

import { useAddSetlist } from '../api/useSetlist';
import { useSpotify } from '../contexts/SpotifyContext';
import type { Setlist, Song } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { DialogTitle } from '../ui/DialogTitle';
import { InputField } from '../ui/form/InputField';

type FormData = {
  playlistUrl: string;
};

type ImportSpotifyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ImportSpotifyDialog({ isOpen, onClose }: ImportSpotifyDialogProps) {
  const navigate = useNavigate();
  const store = useStore();
  const { sdk } = useSpotify();
  const addSetlist = useAddSetlist();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (playlistId: string) => {
      if (!sdk) {
        throw new Error('Spotify SDK not available');
      }
      return await sdk.playlists.getPlaylist(playlistId);
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      playlistUrl: '',
    },
  });

  const validatePlaylistId = (input: string): boolean | string => {
    return extractPlaylistId(input) ? true : 'Invalid Spotify playlist URL or ID';
  };

  const extractPlaylistId = (input: string): string | null => {
    const trimmed = input.trim();
    try {
      const parsed = parse(trimmed);
      return parsed?.type === 'playlist' ? parsed.id : null;
    } catch {
      return /^[a-zA-Z0-9]{22}$/.test(trimmed) ? trimmed : null;
    }
  };

  const handleImport = (data: FormData) => {
    const playlistId = extractPlaylistId(data.playlistUrl);
    if (!playlistId || !store) {
      return;
    }

    mutate(playlistId, {
      onSuccess: (playlist) => {
        const songsTable = store.getTable('songs') || {};
        const existingSongs = new Set(
          Object.entries(songsTable).map(([, songRow]) => {
            const song = songRow as Record<string, unknown>;
            return `${song.title}|${song.artist}`;
          }),
        );

        const songIds: string[] = [];

        playlist.tracks.items.forEach((item) => {
          const track = item.track;
          if (track) {
            const artist = track.artists.map((a) => a.name).join(', ');
            const title = track.name;
            const songKey = `${title}|${artist}`;

            if (existingSongs.has(songKey)) {
              return;
            }

            const songData: Omit<Song, 'id'> = {
              artist,
              key: '',
              timeSignature: '',
              title,
            };

            const songId = store.addRow('songs', songData as unknown as Row);
            if (songId) {
              songIds.push(songId);
              existingSongs.add(songKey);
            }
          }
        });

        if (songIds.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const setlistData: Omit<Setlist, 'id'> = {
            date: today,
            sets: [
              {
                setNumber: 1,
                songs: songIds.map((songId) => ({ songId })),
              },
            ],
            title: playlist.name,
          };

          addSetlist(setlistData);
        }

        reset();
        onClose();
        navigate('/setlists');
      },
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={isOpen}>
      <DialogTitle>Import from Spotify</DialogTitle>

      <form autoComplete="off" noValidate onSubmit={handleSubmit(handleImport)}>
        <div className="space-y-4">
          <InputField
            error={errors.playlistUrl}
            helperText="Paste a Spotify playlist share link or playlist ID"
            id="playlist-url"
            label="Playlist URL or ID"
            placeholder="https://open.spotify.com/playlist/... or just the ID"
            register={register('playlistUrl', {
              required: 'Playlist URL or ID is required',
              validate: validatePlaylistId,
            })}
            required
          />

          {error && (
            <Alert severity="error">{error instanceof Response ? 'Oeps' : error.message}</Alert>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={handleClose} type="button" variant="ghost">
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={isPending}
              iconStart={<IconUpload className="h-4 w-4" />}
              type="submit"
              variant="filled"
            >
              {isPending ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
