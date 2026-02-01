import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../components/Button';
import { Page } from '../components/Page';
import { PageHeader } from '../components/PageHeader';
import { SetlistCard } from '../components/SetlistCard';
import { SortButton } from '../components/SortButton';
import { store } from '../store/store';
import { useSetlists } from '../store/useStore';

export function ManageSetlistsPage() {
  const setlists = useSetlists();
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'none'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'none'>('desc');

  const handleSort = (field: 'title' | 'date') => {
    if (sortBy === field) {
      // Cycle through: asc -> desc -> none
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortDirection('none');
        setSortBy('none');
      }
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const getSortedSetlists = () => {
    if (sortBy === 'none' || sortDirection === 'none') {
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <p className="text-slate-400">No setlists yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="mb-4 flex gap-1.5">
            <SortButton
              isActive={sortBy === 'title' && sortDirection !== 'none'}
              label="Title"
              onClick={() => handleSort('title')}
              sortDirection={
                sortBy === 'title' && sortDirection !== 'none' ? sortDirection : undefined
              }
            />
            <SortButton
              isActive={sortBy === 'date' && sortDirection !== 'none'}
              label="Date"
              onClick={() => handleSort('date')}
              sortDirection={
                sortBy === 'date' && sortDirection !== 'none' ? sortDirection : undefined
              }
            />
          </div>

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
      )}
    </Page>
  );
}
