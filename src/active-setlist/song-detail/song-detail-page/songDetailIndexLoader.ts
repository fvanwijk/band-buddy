import { redirect } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';

import { parseSongDefaultTab } from '../../../api/useSong';
import type { SongDetailTab } from '../../../schemas';
import { createAppStore, createStorePersister } from '../../../store/store';

async function getDefaultSongTab(
  setlistId: string,
  setIndex: number,
  songIndex: number,
): Promise<SongDetailTab> {
  const store = createAppStore();
  const persister = createStorePersister(store);
  await persister.load();

  const setlistSetsTable = store.getTable('setlistSets') as Record<string, Record<string, unknown>>;
  const setlistSetEntry = Object.entries(setlistSetsTable).find(
    ([, setRow]) => setRow.setlistId === setlistId && Number(setRow.setIndex) === setIndex,
  );
  if (!setlistSetEntry) {
    return 'lyrics';
  }

  const [setId] = setlistSetEntry;
  const setlistSongsTable = store.getTable('setlistSongs') as Record<
    string,
    Record<string, unknown>
  >;
  const setlistSongEntry = Object.entries(setlistSongsTable).find(
    ([, setlistSongRow]) =>
      setlistSongRow.setId === setId && Number(setlistSongRow.songIndex) === songIndex,
  );
  if (!setlistSongEntry) {
    return 'lyrics';
  }

  const [, setlistSongRow] = setlistSongEntry;
  const songId = String(setlistSongRow.songId);
  const songRow = store.getRow('songs', songId) as Record<string, unknown> | null | undefined;

  return parseSongDefaultTab(songRow) || 'lyrics';
}

export async function songDetailIndexLoader({ params }: LoaderFunctionArgs) {
  const { setlistId, setIndex, songIndex } = params;

  if (!setlistId || !setIndex || !songIndex) {
    return redirect('/'); // TODO 404
  }

  const defaultTab = await getDefaultSongTab(setlistId, Number(setIndex), Number(songIndex));

  return redirect(`/play/${setlistId}/${setIndex}/${songIndex}/${defaultTab}`);
}
