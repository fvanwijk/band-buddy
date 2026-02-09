import { IconBrandSpotify } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { Row } from 'tinybase';
import { useStore } from 'tinybase/ui-react';

import { useImportSpotifyPlaylist } from '../api/useImportSpotifyPlaylist';
import { useAddSetlist } from '../api/useSetlist';
import type { Setlist, Song } from '../types';
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
  const { isPending, mutate, error, reset: resetMutation } = useImportSpotifyPlaylist();
  const addSetlist = useAddSetlist();

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

  const extractPlaylistId = (input: string): string | null => {
    // Remove whitespace
    const trimmed = input.trim();

    // Try to extract from URL
    const urlMatch = trimmed.match(/playlist\/([a-zA-Z0-9]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }

    // Check if it's already just an ID (alphanumeric, typically 22 chars)
    if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
      return trimmed;
    }

    return null;
  };

  const handleImport = (data: FormData) => {
    const playlistId = extractPlaylistId(data.playlistUrl);

    if (!playlistId) {
      return;
    }

    mutate(playlistId, {
      onSuccess: (playlist) => {
        if (!store) return;

        // Log the songs
        console.log('Fetched Spotify playlist:', playlist.name);

        // Get existing songs to check for duplicates
        const songsTable = store.getTable('songs') || {};
        const existingSongs = new Set(
          Object.entries(songsTable).map(([, songRow]) => {
            const song = songRow as Record<string, unknown>;
            return `${song.title}|${song.artist}`;
          }),
        );

        // Create songs from Spotify tracks
        const songIds: string[] = [];

        playlist.tracks.items.forEach((item) => {
          const track = item.track;
          if (track) {
            const artist = track.artists.map((a) => a.name).join(', ');
            const title = track.name;

            // Check if song already exists
            const songKey = `${title}|${artist}`;
            if (existingSongs.has(songKey)) {
              return;
            }

            // Create song object
            const songData: Omit<Song, 'id'> = {
              artist,
              key: '',
              timeSignature: '',
              title,
            };

            // Add song directly to store and capture the ID
            const songId = store.addRow('songs', songData as unknown as Row);
            if (songId) {
              songIds.push(songId);
              // Add to existing songs map to avoid duplicates within this import
              existingSongs.add(songKey);
            }
          }
        });

        // Create setlist with all imported songs
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

        // Success - close dialog and navigate to setlists
        reset();
        onClose();
        navigate('/setlists');
      },
    });
  };

  const handleClose = () => {
    reset();
    resetMutation();
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
            register={register('playlistUrl', { required: 'Playlist URL or ID is required' })}
            required
          />

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error.message}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={handleClose} type="button" variant="ghost">
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={isPending}
              iconStart={<IconBrandSpotify className="h-4 w-4" />}
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
