import { IconPlaylistOff } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useRow, useTable, useValue } from 'tinybase/ui-react';

import { EmptyState } from '../components/EmptyState';
import SetlistHeader from '../components/SetlistHeader';
import SetlistTable from '../components/SetlistTable';
import type { Setlist, Song } from '../types/setlist';

function ActiveSetlistPage() {
  const activeSetlistId = useValue('activeSetlistId') as string | undefined;
  const setlistRow = useRow('setlists', activeSetlistId || '');
  const songsTable = useTable('songs');

  if (!activeSetlistId || !setlistRow) {
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

  // Parse setlist data
  let setlist: Setlist;
  try {
    const data = setlistRow?.data as string | undefined;
    setlist = data ? JSON.parse(data) : { date: '', id: activeSetlistId, sets: [], title: '' };
  } catch {
    setlist = { date: '', id: activeSetlistId, sets: [], title: '' };
  }

  // Build songs map for quick lookup
  const songsMap: Record<string, Song> = {};
  Object.entries(songsTable || {}).forEach(([id, song]) => {
    songsMap[id] = {
      artist: song.artist as string,
      duration: song.duration as string | undefined,
      id,
      key: song.key as string,
      timeSignature: song.timeSignature as string,
      title: song.title as string,
    };
  });

  // Calculate total songs
  const songCount = setlist.sets.reduce((total, s) => total + s.songs.length, 0);

  return (
    <div className="flex h-full flex-col gap-3">
      <SetlistHeader date={setlist.date} name={setlist.title} songCount={songCount} venue="" />

      <SetlistTable sets={setlist.sets} songsMap={songsMap} />
    </div>
  );
}

export default ActiveSetlistPage;
