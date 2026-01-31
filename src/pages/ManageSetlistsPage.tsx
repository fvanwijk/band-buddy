import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Setlists</h1>
        <button
          className="rounded bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          onClick={() => navigate('/setlist/add')}
        >
          Add Setlist
        </button>
      </div>

      {displaySetlists.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">
            No setlists yet. Create one to get started!
          </p>
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
              onDelete={() => handleDelete(setlist.id)}
              onEdit={() => handleEdit(setlist.id)}
              setsCount={setlist.sets.length}
              songsCount={setlist.sets.reduce((total, s) => total + s.songs.length, 0)}
              title={setlist.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}
