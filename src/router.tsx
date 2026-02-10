import { Navigate, createBrowserRouter } from 'react-router-dom';

import { ActiveSetlistPage } from './active-setlist/ActiveSetlistPage';
import { SongDetailPage } from './active-setlist/song-detail/SongDetailPage';
import { Home } from './home/Home';
import { Layout } from './Layout';
import { NotFoundPage } from './NotFoundPage';
import { AddSetlistPage } from './setlists/form/AddSetlistPage';
import { EditSetlistPage } from './setlists/form/EditSetlistPage';
import { ManageSetlistsPage } from './setlists/ManageSetlistsPage';
import { AddInstrumentPage } from './settings/instruments/form/AddInstrumentPage';
import { EditInstrumentPage } from './settings/instruments/form/EditInstrumentPage';
import { SettingsPage } from './settings/SettingsPage';
import { AddSongPage } from './songs/form/AddSongPage';
import { EditSongPage } from './songs/form/EditSongPage';
import { ManageSongsPage } from './songs/ManageSongsPage';

export const router = createBrowserRouter([
  {
    element: <Home />,
    index: true,
  },
  {
    children: [
      {
        element: <ActiveSetlistPage />,
        path: '/play',
      },
      {
        children: [
          {
            element: <Navigate to="details" replace />,
            index: true,
          },
          {
            element: <SongDetailPage />,
            path: ':tab',
          },
        ],
        path: '/setlist/:setlistId/song/:songId',
      },
      {
        element: <ManageSetlistsPage />,
        path: '/setlists',
      },
      {
        element: <AddSetlistPage />,
        path: '/setlists/add',
      },
      {
        element: <EditSetlistPage />,
        path: '/setlists/edit/:id',
      },
      {
        element: <ManageSongsPage />,
        path: '/songs',
      },
      {
        children: [
          {
            element: <Navigate to="details" replace />,
            index: true,
          },
          {
            element: <AddSongPage />,
            path: ':tab',
          },
        ],
        path: '/songs/add',
      },
      {
        children: [
          {
            element: <Navigate to="details" replace />,
            index: true,
          },
          {
            element: <EditSongPage />,
            path: ':tab',
          },
        ],
        path: '/songs/edit/:id',
      },
      {
        children: [
          {
            element: <Navigate to="general" replace />,
            index: true,
          },
          {
            element: <SettingsPage />,
            path: ':tab',
          },
        ],
        path: '/settings',
      },
      {
        element: <AddInstrumentPage />,
        path: '/settings/instruments/add',
      },
      {
        element: <EditInstrumentPage />,
        path: '/settings/instruments/:id/edit',
      },
      {
        element: <Navigate to="/" replace />,
        path: '*',
      },
    ],
    element: <Layout />,
    errorElement: <NotFoundPage />,
  },
]);
