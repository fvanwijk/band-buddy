import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Page } from '../components/Page';
import { SetlistCard } from '../components/SetlistCard';
import { SortButton } from '../components/SortButton';
import { store } from '../store/store';
import { useSetlists } from '../store/useStore';

export function ManageSetlistsPage() {
  const navigate = useNavigate();
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

  const handleEdit = (id: string) => {
    navigate(`/setlist/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this setlist?')) {
      store.delRow('setlists', id);
    }
  };

  const displaySetlists = getSortedSetlists();

  return (
    <Page>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">Library</p>
          <h1 className="text-2xl font-semibold text-slate-100">Setlists</h1>
        </div>
        <Link
          to="/setlist/add"
          className="rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200 hover:bg-brand-400/20"
        >
          New setlist
        </Link>
      </header>

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
