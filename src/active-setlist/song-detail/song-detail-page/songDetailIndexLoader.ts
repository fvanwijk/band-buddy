import { redirect } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';

import { parseSongDefaultTab } from '../../../api/useSong';
import type { SongDetailTab } from '../../../schemas';
import { createAppStore, createStorePersister } from '../../../store/store';

async function getDefaultSongTab(songId: string): Promise<SongDetailTab> {
  const store = createAppStore();
  const persister = createStorePersister(store);
  await persister.load();

  const songRow = store.getRow('songs', songId) as Record<string, unknown> | null | undefined;
  const parsedTab = parseSongDefaultTab(songRow);

  return parsedTab || 'lyrics';
}

export async function songDetailIndexLoader({ params }: LoaderFunctionArgs) {
  const { setlistId, songId } = params;

  if (!setlistId || !songId) {
    return redirect('/');
  }

  const defaultTab = await getDefaultSongTab(songId);

  return redirect(`/setlist/${setlistId}/song/${songId}/${defaultTab}`);
}
