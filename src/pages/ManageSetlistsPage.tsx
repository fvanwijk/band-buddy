import { IconPlaylist } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useValue } from 'tinybase/ui-react';

import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Page } from '../components/Page';
import { PageHeader } from '../components/PageHeader';
import { SetlistCard } from '../components/SetlistCard';
import { SortButtonsBar } from '../components/SortButtonsBar';
import { useSortState } from '../hooks/useSortState';
import { useDeleteSetlist, useGetSetlists } from '../hooks/useSetlist';
import { useActivateSetlist } from '../hooks/useSettings';

type SortField = 'date' | 'title';

export function ManageSetlistsPage() {
  const navigate = useNavigate();
  const setlists = useGetSetlists();
  const activeSetlistId = useValue('activeSetlistId') as string | undefined;
  const { sortBy, sortDirection, handleSort, isActive } = useSortState<SortField>('date', 'desc');
  const activateSetlist = useActivateSetlist(() => navigate('/'));
  const deleteSetlist = useDeleteSetlist();

  const handleActivate = (id: string) => {
    activateSetlist(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this setlist?')) {
      deleteSetlist(id);
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
          <Button as={Link} color="primary" to="/setlists/add" variant="outlined">
            New setlist
          </Button>
        }
        title="Setlists"
      />

      {displaySetlists.length === 0 ? (
        <EmptyState
          description="Create your first setlist to get started!"
          icon={<IconPlaylist className="w-12 h-12" />}
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
                onDelete={() => handleDelete(setlist.id)}
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
