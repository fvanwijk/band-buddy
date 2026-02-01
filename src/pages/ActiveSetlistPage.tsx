import { IconPlaylistOff } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useValue } from 'tinybase/ui-react';

import { EmptyState } from '../components/EmptyState';
import SetlistHeader from '../components/SetlistHeader';
import SetlistTable from '../components/SetlistTable';
import { useGetSetlist } from '../hooks/useSetlist';
import { useGetSongs } from '../hooks/useSong';
import type { Song } from '../types';

function ActiveSetlistPage() {
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

  // Calculate total songs
  const songCount = setlist.sets.reduce((total, s) => total + s.songs.length, 0);

  return (
    <div className="flex h-full flex-col gap-3">
      <SetlistHeader
        date={setlist.date}
        name={setlist.title}
        songCount={songCount}
        venue={setlist.venue}
      />

      <SetlistTable sets={setlist.sets} songsMap={songsMap} />
    </div>
  );
}

export default ActiveSetlistPage;
