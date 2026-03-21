import { IconUpload } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { parse } from 'spotify-uri';
import { useStore } from 'tinybase/ui-react';

import { useSpotify } from '../contexts/SpotifyContext';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { InputField } from '../ui/form/InputField';
import { useProcessSpotifyPlaylist } from './importSpotifyPlaylist';

type FormData = {
  playlistUrl: string;
};

export type ImportSpotifyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ImportSpotifyDialog({ isOpen, onClose }: ImportSpotifyDialogProps) {
  const store = useStore();
  const { sdk } = useSpotify();
  const processSpotifyPlaylist = useProcessSpotifyPlaylist();

  const {
    mutate,
    isPending,
    error,
    reset: resetMutation,
  } = useMutation({
    mutationFn: async (playlistId?: string) => {
      if (!playlistId || !store || !sdk) {
        // PlaylistID is validated by react-hook-form, so this should never happen
        throw new Error('An unexpected error occurred.');
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
    mode: 'onBlur',
  });

  const validatePlaylistId = (input: string): boolean | string =>
    !!extractPlaylistId(input) || 'Invalid Spotify playlist URL or ID';

  const extractPlaylistId = (input: string): string | undefined => {
    const trimmed = input.trim();
    try {
      const parsed = parse(trimmed);
      return parsed?.type === 'playlist' ? parsed.id : undefined;
    } catch {
      return /^[a-zA-Z0-9]{22}$/.test(trimmed) ? trimmed : undefined;
    }
  };

  const resetAndClose = () => {
    reset();
    resetMutation();
    onClose();
  };

  const handleImport = (data: FormData) => {
    const playlistId = extractPlaylistId(data.playlistUrl);

    mutate(playlistId, {
      onSuccess: (playlist) => {
        processSpotifyPlaylist(playlist);
        resetAndClose();
      },
    });
  };

  const handleClose = () => {
    resetAndClose();
  };

  return (
    <Dialog onClose={handleClose} open={isOpen} title="Import from Spotify">
      <form autoComplete="off" noValidate onSubmit={handleSubmit(handleImport)}>
        <div className="space-y-4">
          <InputField
            error={errors.playlistUrl}
            helperText="Paste a Spotify playlist share link or playlist ID"
            label="Playlist URL or ID"
            placeholder="https://open.spotify.com/playlist/... or just the ID"
            {...register('playlistUrl', {
              required: 'Playlist URL or ID is required',
              validate: validatePlaylistId,
            })}
            required
          />

          {error && <Alert severity="error">{error.message}</Alert>}

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={handleClose} type="button" variant="outlined">
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
