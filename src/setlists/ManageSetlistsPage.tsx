import { IconPlaylist, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useValue } from 'tinybase/ui-react';

import { SetlistCard } from './SetlistCard';
import { useDeleteSetlist, useGetSetlists } from '../api/useSetlist';
import { useActivateSetlist } from '../api/useSettings';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { Page } from '../ui/Page';
import { PageHeader } from '../ui/PageHeader';
import { SortButtonsBar } from '../ui/sorting/SortButtonsBar';
import { useSortState } from '../ui/sorting/useSortState';

type SortField = 'date' | 'title';

export function ManageSetlistsPage() {
  const navigate = useNavigate();
  const setlists = useGetSetlists();
  const activeSetlistId = useValue('activeSetlistId') as string | undefined;
  const [deletingSetlistId, setDeletingSetlistId] = useState<string | null>(null);
  const { sortBy, sortDirection, handleSort, isActive } = useSortState<SortField>('date', 'desc');
  const activateSetlist = useActivateSetlist(() => navigate('/'));
  const deleteSetlist = useDeleteSetlist(() => setDeletingSetlistId(null));

  const handleActivate = (id: string) => {
    activateSetlist(id);
  };

  const handleDeleteSetlist = () => {
    if (deletingSetlistId) {
      deleteSetlist(deletingSetlistId);
    }
  };

  const getSortedSetlists = () => {
    if (!sortBy || sortDirection === 'none') {
      return setlists;
    }

    const sorted = [...setlists];
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  const displaySetlists = getSortedSetlists();

  return (
    <Page>
      <PageHeader
        action={
          <Button
            as={Link}
            iconStart={<IconPlus className="h-4 w-4" />}
            color="primary"
            to="/setlists/add"
            variant="outlined"
          >
            New setlist
          </Button>
        }
        title="Setlists"
      />

      <ConfirmDialog
        isOpen={deletingSetlistId !== null}
        message="Are you sure you want to delete this setlist? This action cannot be undone."
        onClose={() => setDeletingSetlistId(null)}
        onConfirm={handleDeleteSetlist}
        title="Delete Setlist"
      />

      {displaySetlists.length === 0 ? (
        <EmptyState
          description="Create your first setlist to get started!"
          icon={<IconPlaylist className="h-12 w-12" />}
          title="No setlists yet"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <SortButtonsBar
            fields={['date', 'title'] as const}
            isActive={isActive}
            onSort={handleSort}
            sortDirection={sortDirection}
          />

          <div className="grid gap-2">
            {displaySetlists.map((setlist) => (
              <SetlistCard
                key={setlist.id}
                date={setlist.date}
                id={setlist.id}
                isActive={activeSetlistId === setlist.id}
                onActivate={() => handleActivate(setlist.id)}
                onDelete={() => setDeletingSetlistId(setlist.id)}
                setsCount={setlist.sets.length}
                songsCount={setlist.sets.reduce((total, s) => total + s.songs.length, 0)}
                title={setlist.title}
              />
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
