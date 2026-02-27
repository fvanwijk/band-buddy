import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AddSetlistPage } from './AddSetlistPage';
import { StoreProvider } from '../../store/StoreProvider';
import { MockRouteProvider, getMockStore } from '../../testUtils';

describe('AddSetlistPage', () => {
  it('should render a form to add a setlist', async () => {
    const user = userEvent.setup();
    const { store, persister } = getMockStore();

    render(<AddSetlistPage />, {
      wrapper: ({ children }) => {
        const RoutesStub = createRoutesStub([
          { Component: () => 'Setlist overview', path: '/setlists' },
          { Component: () => children, path: '/setlists/add' },
        ]);

        return (
          <StoreProvider>
            <RoutesStub initialEntries={['/setlists/add']} />
          </StoreProvider>
        );
      },
    });

    expect(await screen.findByRole('heading', { name: 'Add new setlist' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Setlist title*'), 'Test Setlist');

    await user.click(screen.getByRole('button', { name: 'Create setlist' }));

    expect(await screen.findByText('Setlist overview')).toBeInTheDocument();

    await persister.load();
    expect(store.getTable('setlists')).toEqual({
      '0': {
        date: new Date().toISOString().split('T')[0],
        title: 'Test Setlist',
        venue: '',
      },
    });
  });

  it('should render a backlink', () => {
    render(<AddSetlistPage />, { wrapper: MockRouteProvider });

    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/setlists');
    expect(screen.getByRole('link', { name: 'Go back' })).toHaveAttribute('href', '/setlists');
  });
});
