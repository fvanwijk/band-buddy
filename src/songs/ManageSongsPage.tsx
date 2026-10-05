import { IconMusic, IconPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { useGetSetlists } from '../api/useSetlist';
import { useDeleteSong, useGetSongs } from '../api/useSong';
import { useSortedArray } from '../hooks/useSortedArray';
import { Grid } from '../settings/Grid';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { Page } from '../ui/Page';
import { PageHeader } from '../ui/PageHeader';
import { SortButtonsBar } from '../ui/sorting/SortButtonsBar';
import { useSortState } from '../ui/sorting/useSortState';
import { pluralize } from '../utils/pluralize';
import { emptySongFilters, filterSongs } from './filterSongs';
import type { SongFilters } from './filterSongs';
import { SongCard } from './SongCard';
import { SongFilterPanel } from './SongFilterPanel';
import { useActiveSongFilters } from './useActiveSongFilters';

type SortField = 'artist' | 'duration' | 'key' | 'title';

export function ManageSongsPage() {
  const allSongs = useGetSongs();
  const setlists = useGetSetlists();

  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const form = useForm<SongFilters>({ defaultValues: emptySongFilters });
  const { control } = form;
  const filters: SongFilters = { ...emptySongFilters, ...useWatch({ control }) };
  const activeFilters = useActiveSongFilters(form);
  const { sortBy, sortDirection, handleSort, isActive } = useSortState<SortField>(null, 'none');
  const deleteSong = useDeleteSong(() => setDeletingSongId(null));

  const handleDeleteSong = () => {
    if (deletingSongId) {
      deleteSong(deletingSongId);
    }
  };

  // Songs without a duration sort as 0
  const sortedSongs = useSortedArray(allSongs, sortBy, sortDirection, (song, field) =>
    field === 'duration' ? (song.duration ?? 0) : (song[field] ?? ''),
  );

  const setlistSongIds = useMemo(
    () =>
      Object.fromEntries(
        setlists.map((setlist) => [
          setlist.id,
          new Set(setlist.sets.flatMap((set) => set.songs.map((song) => song.songId))),
        ]),
      ),
    [setlists],
  );
  const setlistOptions = useMemo(
    () => setlists.map((setlist) => ({ id: setlist.id, name: setlist.title })),
    [setlists],
  );
  const keyOptions = useMemo(
    () =>
      [...new Set(allSongs.flatMap((song) => (song.key ? [song.key] : [])))].toSorted((a, b) =>
        a.localeCompare(b),
      ),
    [allSongs],
  );

  const maxDurationMinutes = useMemo(
    () => Math.max(1, Math.ceil(Math.max(0, ...allSongs.map((song) => song.duration ?? 0)) / 60)),
    [allSongs],
  );

  const displayedSongs = filterSongs(sortedSongs, { filters, setlistSongIds });

  return (
    <Page>
      <PageHeader
        action={
          <Button
            as={Link}
            color="primary"
            iconStart={<IconPlus className="h-4 w-4" />}
            to="/songs/add"
            variant="outlined"
          >
            New song
          </Button>
        }
        title="Songs"
      />

      <ConfirmDialog
        isOpen={deletingSongId !== null}
        onClose={() => setDeletingSongId(null)}
        onConfirm={handleDeleteSong}
        title="Delete Song"
        message="Are you sure you want to delete this song? This action cannot be undone."
      />

      {sortedSongs.length === 0 ? (
        <EmptyState
          description="Add songs to build your repertoire and use them in setlists."
          icon={<IconMusic className="h-12 w-12" />}
          title="No songs in your library"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <SortButtonsBar
              fields={['title', 'artist', 'key', 'duration'] as const}
              isActive={isActive}
              onSort={handleSort}
              sortDirection={sortDirection}
            />
            <span className="hidden text-sm text-slate-100 sm:inline">
              Showing {displayedSongs.length} of {pluralize(sortedSongs.length, 'song')}
            </span>
            <span className="text-sm text-slate-100 sm:hidden">
              {displayedSongs.length} of {sortedSongs.length}
            </span>
          </div>
          <FormProvider {...form}>
            <SongFilterPanel
              activeIds={activeFilters.activeIds}
              keyOptions={keyOptions}
              maxDurationMinutes={maxDurationMinutes}
              onAdd={activeFilters.add}
              onClear={activeFilters.clear}
              onRemove={activeFilters.remove}
              setlistOptions={setlistOptions}
            />
          </FormProvider>
          <Grid>
            {displayedSongs.map((song) => (
              <SongCard
                key={song.id}
                artist={song.artist}
                duration={song.duration}
                keyNote={song.key}
                onDelete={() => setDeletingSongId(song.id)}
                songId={song.id}
                timeSignature={song.timeSignature}
                title={song.title}
                transpose={song.transpose}
              />
            ))}
          </Grid>
        </div>
      )}
    </Page>
  );
}
