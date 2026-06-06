import type { Artist, Playlist, Track } from '@spotify/web-api-ts-sdk';
import type { Row } from 'tinybase';
import { useStore } from 'tinybase/ui-react';

import { useAddSetlist } from '../api/useSetlist';
import type { SetlistSetTable, SetlistSongTable, SetlistTable, Song } from '../types';

/**
 * Hook to process a Spotify playlist and prepare songs and setlist data for import.
 * Handles deduplication, adds songs to the store, and creates the setlist.
 */
export function useProcessSpotifyPlaylist() {
  const store = useStore();
  const addSetlist = useAddSetlist();

  return (playlist: Playlist): void => {
    if (!store) {
      return;
    }
    const songsTable = store.getTable('songs') || {};
    const existingSongIdsByKey = new Map<string, string>(
      Object.entries(songsTable).map(([songId, songRow]) => {
        const song = songRow as Record<string, unknown>;
        const artist = typeof song.artist === 'string' ? song.artist : '';
        const title = typeof song.title === 'string' ? song.title : '';
        return [`${title}|${artist}`, songId] as const;
      }),
    );

    const songIds: string[] = [];

    playlist.tracks.items.forEach((item) => {
      const track = item.track;
      if (track) {
        const artist = (track as Track & { artists: Artist[] }).artists
          .map((a) => a.name)
          .join(', ');
        const title = track.name;
        const songKey = `${title}|${artist}`;
        const existingSongId = existingSongIdsByKey.get(songKey);

        if (existingSongId) {
          songIds.push(existingSongId);
          return;
        }

        const songData: Omit<Song, 'id'> = {
          artist,
          duration: Math.round(track.duration_ms / 1000),
          key: '',
          spotifyId: track.id,
          timeSignature: '',
          title,
        };

        const songId = store.addRow('songs', songData as unknown as Row);
        if (songId) {
          songIds.push(songId);
          existingSongIdsByKey.set(songKey, songId);
        }
      }
    });

    if (songIds.length === 0) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const setlistData: SetlistTable & {
      sets: (SetlistSetTable & { songs: SetlistSongTable[] })[];
    } = {
      date: today,
      sets: [
        {
          name: '',
          setIndex: 0,
          setlistId: '', // Will be set after creation
          songs: songIds.map((songId, songIndex) => ({
            setId: 'spotify-set',
            songId,
            songIndex,
          })),
        },
      ],
      title: playlist.name,
    };

    addSetlist(setlistData);
  };
}
