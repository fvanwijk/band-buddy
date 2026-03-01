import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SetCard } from './SetCard';
import { createSetlistSetsWithSongs } from '../mocks/setlistSets';
import { MockRouteProvider } from '../testUtils';

describe('SetCard', () => {
  it('renders set name and duration', async () => {
    const sets = createSetlistSetsWithSongs();
    sets[1].name = 'Named set';
    const { rerender } = render(
      <SetCard setIndex={0} set={sets[0]} setlistId="3" songStartIndex={0} />,
      { wrapper: MockRouteProvider },
    );

    expect(screen.getByText('Set 1')).toBeInTheDocument();
    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();
    expect(screen.getByText('September')).toBeInTheDocument();
    expect(screen.getByText('Superstition')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    await rerender(<SetCard setIndex={1} set={sets[1]} setlistId="3" songStartIndex={3} />);

    expect(screen.getByText('Named set')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByTestId('set-duration')).toHaveTextContent('9m 5s');
  });

  it('skips orphaned setlist songs and renders empty sets', () => {
    const set = createSetlistSetsWithSongs()[0];
    set.songs = [{ id: 'orphaned-song', setId: set.id, songId: 'orphaned-song', songIndex: 3 }];
    render(<SetCard setIndex={0} set={set} setlistId="0" songStartIndex={0} />, {
      wrapper: MockRouteProvider,
    });

    expect(screen.getByText('No songs in this set')).toBeInTheDocument();
    expect(screen.getByTestId('set-duration')).toHaveTextContent('0m 0s');
  });
});
