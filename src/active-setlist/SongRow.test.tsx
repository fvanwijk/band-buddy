import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SongRow } from './SongRow';
import { createSong } from '../mocks/songs';
import { MockRouteProvider } from '../testUtils';

describe('SongRow', () => {
  it('renders song details', () => {
    render(
      <ul>
        <SongRow index={3} setlistId="2" song={createSong()} />
      </ul>,
      { wrapper: MockRouteProvider },
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/setlist/2/song/0');
    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();
    expect(screen.getByText('Queen')).toBeInTheDocument();
    expect(screen.getByText('Bb')).toBeInTheDocument();
    expect(screen.getByTestId('song-duration')).toHaveTextContent('5m 55s');
    expect(screen.getByText('4/4')).toBeInTheDocument();
  });
});
