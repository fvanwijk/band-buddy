import { IconPlaylist } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Page } from '../components/Page';
import { PageHeader } from '../components/PageHeader';
import { SetlistCard } from '../components/SetlistCard';
import { SortButtonsBar } from '../components/SortButtonsBar';
import { useSortState } from '../hooks/useSortState';
import { store } from '../store/store';
import { useSetlists } from '../store/useStore';

type SortField = 'date' | 'title';

export function ManageSetlistsPage() {
  const setlists = useSetlists();
  const { sortBy, sortDirection, handleSort, isActive } = useSortState<SortField>('date', 'desc');

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

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this setlist?')) {
      store.delRow('setlists', id);
    }
  };

  const displaySetlists = getSortedSetlists();

  return (
    <Page>
      <PageHeader
        action={
          <Button as={Link} color="primary" to="/setlist/add" variant="outlined">
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
