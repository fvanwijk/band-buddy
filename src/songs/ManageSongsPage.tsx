import { IconFilter, IconMusic, IconPlus, IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { useGetSetlists } from '../api/useSetlist';
import { useDeleteSong, useGetSongs } from '../api/useSong';
import { useSortedArray } from '../hooks/useSortedArray';
import { Grid } from '../settings/Grid';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { InputField } from '../ui/form/InputField';
import { Page } from '../ui/Page';
import { PageHeader } from '../ui/PageHeader';
import { SortButtonsBar } from '../ui/sorting/SortButtonsBar';
import { useSortState } from '../ui/sorting/useSortState';
import { pluralize } from '../utils/pluralize';
import { countActiveFilters, emptySongFilters, filterSongs } from './filterSongs';
import type { SongFilters } from './filterSongs';
import { SongCard } from './SongCard';
import { SongFilterPanel } from './SongFilterPanel';

type SortField = 'artist' | 'duration' | 'key' | 'title';

export function ManageSongsPage() {
  const allSongs = useGetSongs();
  const setlists = useGetSetlists();

  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const { control, register, reset } = useForm<SongFilters>({ defaultValues: emptySongFilters });
  const filters: SongFilters = { ...emptySongFilters, ...useWatch({ control }) };
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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

  const displayedSongs = filterSongs(sortedSongs, { filters, searchQuery, setlistSongIds });
  const activeFilterCount = countActiveFilters(filters);

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
            <span className="text-sm text-slate-100">
              Showing {displayedSongs.length} of {pluralize(sortedSongs.length, 'song')}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <InputField
                className="pl-10"
                hideLabel
                label="Search"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or artist..."
                size="small"
                type="text"
                value={searchQuery}
              />
            </div>
            <Button
              aria-expanded={showFilters}
              color={activeFilterCount > 0 ? 'primary' : 'default'}
              iconEnd={activeFilterCount > 0 ? <Badge>{activeFilterCount}</Badge> : undefined}
              iconStart={<IconFilter className="h-4 w-4" />}
              onClick={() => setShowFilters((visible) => !visible)}
              variant="outlined"
            >
              Filters
            </Button>
          </div>
          {showFilters && (
            <SongFilterPanel
              control={control}
              keyOptions={keyOptions}
              maxDurationMinutes={maxDurationMinutes}
              onClear={() => reset(emptySongFilters)}
              onClose={() => setShowFilters(false)}
              register={register}
              setlistOptions={setlistOptions}
            />
          )}
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
