import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const getSortSymbol = (field: 'title' | 'date') => {
    if (sortBy !== field) return '';
    if (sortDirection === 'asc') return ' ↑';
    if (sortDirection === 'desc') return ' ↓';
    return '';
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
          <div className="mb-4 flex gap-4 text-sm">
            <button
              className="font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              onClick={() => handleSort('title')}
            >
              Title{getSortSymbol('title')}
            </button>
            <button
              className="font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              onClick={() => handleSort('date')}
            >
              Date{getSortSymbol('date')}
            </button>
          </div>

          {displaySetlists.map((setlist) => (
            <div
              key={setlist.id}
              className="group flex items-center justify-between rounded border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">{setlist.title}</h3>
                <div className="flex gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <span>{new Date(setlist.date).toLocaleDateString()}</span>
                  <span>
                    {setlist.sets.length} set{setlist.sets.length !== 1 ? 's' : ''}
                  </span>
                  <span>{setlist.sets.reduce((total, s) => total + s.songs.length, 0)} songs</span>
                </div>
              </div>

              <div className="ml-4 flex gap-2">
                <button
                  className="rounded bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  onClick={() => handleEdit(setlist.id)}
                >
                  Edit
                </button>
                <button
                  className="rounded bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600"
                  onClick={() => handleDelete(setlist.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
