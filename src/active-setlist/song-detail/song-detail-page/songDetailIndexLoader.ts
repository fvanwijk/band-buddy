import { redirect } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';

import { parseSongDefaultTab } from '../../../api/useSong';
import type { SongDetailTab } from '../../../schemas';
import { createAppStore, createStorePersister } from '../../../store/store';

async function getDefaultSongTab(setlistId: string, setlistSongId: string): Promise<SongDetailTab> {
  const store = createAppStore();
  const persister = createStorePersister(store);
  await persister.load();

  const setlistSongRow = store.getRow('setlistSongs', setlistSongId) as
    | Record<string, unknown>
    | null
    | undefined;
  if (!setlistSongRow) {
    return 'lyrics';
  }

  const setId = String(setlistSongRow.setId);
  const setRow = store.getRow('setlistSets', setId) as Record<string, unknown> | null | undefined;
  if (!setRow || String(setRow.setlistId) !== setlistId) {
    return 'lyrics';
  }

  const songId = String(setlistSongRow.songId);
  const songRow = store.getRow('songs', songId) as Record<string, unknown> | null | undefined;

  return parseSongDefaultTab(songRow) || 'lyrics';
}

export async function songDetailIndexLoader({ params }: LoaderFunctionArgs) {
  const { setlistId, setlistSongId } = params;

  if (!setlistId || !setlistSongId) {
    return redirect('/'); // TODO 404
  }

  const defaultTab = await getDefaultSongTab(setlistId, setlistSongId);

  return redirect(`/play/${setlistId}/${setlistSongId}/${defaultTab}`);
}
