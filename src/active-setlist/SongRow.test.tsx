import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { createSong } from '../mocks/songs';
import { MockRouteProvider } from '../testUtils';
import { SongRow } from './SongRow';

describe('SongRow', () => {
  it('renders song details', () => {
    render(
      <ul>
        <SongRow index={3} setIndex={0} setlistId="2" songIndex={0} song={createSong()} />
      </ul>,
      { wrapper: MockRouteProvider },
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/play/2/0/0');
    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();
    expect(screen.getByText('Queen')).toBeInTheDocument();
    expect(screen.getByText('Bb')).toBeInTheDocument();
    expect(screen.getByTestId('song-duration')).toHaveTextContent('5m 55s');
    expect(screen.getByText('4/4')).toBeInTheDocument();
  });

  it('shows transpose indicator when transpose is non-zero', () => {
    render(
      <ul>
        <SongRow
          index={1}
          setIndex={0}
          setlistId="2"
          song={createSong({ transpose: 2 })}
          songIndex={0}
        />
      </ul>,
      { wrapper: MockRouteProvider },
    );

    expect(screen.getAllByText('+2').length).toBeGreaterThan(0);
  });

  it('shows negative transpose indicator', () => {
    render(
      <ul>
        <SongRow
          index={1}
          setIndex={0}
          setlistId="2"
          song={createSong({ transpose: -3 })}
          songIndex={0}
        />
      </ul>,
      { wrapper: MockRouteProvider },
    );

    expect(screen.getAllByText('-3').length).toBeGreaterThan(0);
  });

  it('does not show transpose indicator when transpose is 0', () => {
    render(
      <ul>
        <SongRow
          index={1}
          setIndex={0}
          setlistId="2"
          song={createSong({ transpose: 0 })}
          songIndex={0}
        />
      </ul>,
      { wrapper: MockRouteProvider },
    );

    expect(screen.queryByText('+0')).toBeNull();
    expect(screen.queryByText('0')).toBeNull();
  });
});
