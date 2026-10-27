import type { FC } from 'react';
import { Navigate, useLoaderData, useLocation, useParams } from 'react-router-dom';

import type { SongDetailTab } from '../../../schemas';

// Redirects to the default tab, keeping the router state (a loader redirect would drop it)
export const SongDetailIndexRedirect: FC = () => {
  const { setlistId, setlistSongId } = useParams<{ setlistId: string; setlistSongId: string }>();
  const defaultTab = useLoaderData() as SongDetailTab;
  const location = useLocation();

  return (
    <Navigate
      replace
      state={location.state}
      to={`/play/${setlistId}/${setlistSongId}/${defaultTab}`}
    />
  );
};
