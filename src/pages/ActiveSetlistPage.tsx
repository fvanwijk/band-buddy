import { IconPlaylistOff } from '@tabler/icons-react';
import { useRow, useTable, useValue } from 'tinybase/ui-react';

import { EmptyState } from '../components/EmptyState';
import SetlistHeader from '../components/SetlistHeader';
import SetlistTable from '../components/SetlistTable';
import type { Song } from '../types/setlist';

function ActiveSetlistPage() {
  const activeSetlistId = useValue('activeSetlistId') as string | undefined;
  const setlist = useRow('setlists', activeSetlistId || '');
  const songsTable = useTable('songs');

  if (!activeSetlistId || !setlist) {
    return (
      <div className="flex h-full">
        <EmptyState
          description="Select or create a setlist to get started with your performance."
          icon={<IconPlaylistOff className="w-12 h-12" />}
          title="No active setlist"
        />
      </div>
    );
  }

  // Get songs in the order specified in the setlist
  const songIds = (setlist.songIds as string)?.split(',') || [];
  const songs: Song[] = songIds
    .map((id) => {
      const songRow = songsTable[id];
      if (!songRow) return null;
      return {
        artist: songRow.artist as string,
        id,
        key: songRow.key as string,
        timeSignature: songRow.timeSignature as string,
        title: songRow.title as string,
      };
    })
    .filter((song): song is Song => song !== null);

  return (
    <div className="flex h-full flex-col gap-3">
      <SetlistHeader
        name={setlist.name as string}
        date={setlist.date as string}
        venue={setlist.venue as string}
        songCount={songs.length}
      />

      <SetlistTable songs={songs} />
    </div>
  );
}

export default ActiveSetlistPage;
