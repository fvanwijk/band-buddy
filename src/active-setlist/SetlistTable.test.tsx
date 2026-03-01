import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SetlistTable } from './SetlistTable';
import { createSetlistSetsWithSongs } from '../mocks/setlistSets';
import { MockRouteProvider } from '../testUtils';

describe('SetlistTable', () => {
  it('renders sets and breaks', () => {
    const sets = createSetlistSetsWithSongs();
    // 3 Sets with 3+2+1 songs
    render(<SetlistTable setlistId="3" sets={sets} />, { wrapper: MockRouteProvider });

    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getAllByText('Break')).toHaveLength(2);

    expect(screen.getByText('Set 1')).toBeInTheDocument();
    expect(screen.getByText('Acoustic Set')).toBeInTheDocument();
    expect(screen.getByText('Encore')).toBeInTheDocument();

    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should render a message when the setlist has no sets', () => {
    render(<SetlistTable setlistId="4" sets={[]} />, { wrapper: MockRouteProvider });

    expect(screen.getByText(/This setlist has no sets./)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit the setlist' })).toHaveAttribute(
      'href',
      '/setlists/edit/4',
    );
  });
});
