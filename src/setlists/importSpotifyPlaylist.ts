import type { Artist, Playlist, Track } from '@spotify/web-api-ts-sdk';
import type { Row } from 'tinybase';
import { useStore } from 'tinybase/ui-react';

import { useAddSetlist } from '../api/useSetlist';
import type { Setlist, Song } from '../types';

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
        const artist = (track as Track & { artists: Artist[] }).artists
          .map((a) => a.name)
          .join(', ');
        const title = track.name;
        const songKey = `${title}|${artist}`;

        if (existingSongs.has(songKey)) {
          return;
        }

        const songData: Omit<Song, 'id'> = {
          artist,
          key: '',
          spotifyId: track.id,
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

    if (songIds.length === 0) {
      return;
    }

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
  };
}
