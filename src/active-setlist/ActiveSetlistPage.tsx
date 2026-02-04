import { IconPlaylistOff } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useValue } from 'tinybase/ui-react';

import { SetlistHeader } from './SetlistHeader';
import { SetlistTable } from './SetlistTable';
import { useGetSetlist } from '../api/useSetlist';
import { useGetSongs } from '../api/useSong';
import type { Song } from '../types';
import { EmptyState } from '../ui/EmptyState';

export function ActiveSetlistPage() {
  const activeSetlistId = useValue('activeSetlistId') as string | undefined;
  const setlist = useGetSetlist(activeSetlistId);
  const songs = useGetSongs();

  if (!activeSetlistId || !setlist) {
    return (
      <div className="flex h-full">
        <EmptyState
          description={
            <>
              Select or create a{' '}
              <Link className="link" to="/setlists">
                setlist
              </Link>{' '}
              to get started with your performance.
            </>
          }
          icon={<IconPlaylistOff className="w-12 h-12" />}
          title="No active setlist"
        />
      </div>
    );
  }

  // Build songs map for quick lookup
  const songsMap = new Map<string, Song>();
  songs.forEach((song) => {
    songsMap.set(song.id, song);
  });

  // Calculate total songs and duration
  const songCount = setlist.sets.reduce((total, s) => total + s.songs.length, 0);
  const totalSeconds = setlist.sets.reduce((total, set) => {
    return (
      total +
      set.songs.reduce((setTotal, songRef) => {
        const song = songsMap.get(songRef.songId);
        return setTotal + (song?.duration || 0);
      }, 0)
    );
  }, 0);

  return (
    <div className="flex h-full flex-col gap-3">
      <SetlistHeader
        date={setlist.date}
        name={setlist.title}
        songCount={songCount}
        totalSeconds={totalSeconds}
        venue={setlist.venue}
      />

      <SetlistTable setlistId={activeSetlistId} sets={setlist.sets} songsMap={songsMap} />
    </div>
  );
}
