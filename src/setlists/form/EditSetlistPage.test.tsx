import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { EditSetlistPage } from './EditSetlistPage';
import { seedSetlists } from '../../mocks/seed';
import { StoreProvider } from '../../store/StoreProvider';
import { MockRouteProvider, getMockStore } from '../../testUtils';

describe('EditSetlistPage', () => {
  const renderComponent = async () => {
    const { store, persister } = getMockStore();
    seedSetlists(store);
    await persister.save();

    return render(<EditSetlistPage />, {
      wrapper: ({ children }) => {
        const RoutesStub = createRoutesStub([
          { Component: () => 'Setlist overview', path: '/setlists' },
          { Component: () => children, path: '/setlists/edit/:id' },
        ]);

        return (
          <StoreProvider>
            <RoutesStub initialEntries={['/setlists/edit/0']} />
          </StoreProvider>
        );
      },
    });
  };

  it('should render a form to edit a setlist', async () => {
    const user = userEvent.setup();

    await renderComponent();

    expect(await screen.findByRole('heading', { name: 'Edit setlist' })).toBeInTheDocument();

    const titleField = screen.getByLabelText('Setlist title*');
    await user.clear(titleField);
    await user.type(titleField, 'Title changed');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Setlist overview')).toBeInTheDocument();

    const { store, persister } = getMockStore();
    await persister.load();
    expect(store.getTable('setlists')['0']).toEqual({
      date: '2026-02-26',
      title: 'Title changed',
      venue: 'The Grand Arena',
    });
  });

  it('should render a backlink', async () => {
    await renderComponent();

    expect(await screen.findByRole('link', { name: 'Cancel' })).toHaveAttribute(
      'href',
      '/setlists',
    );
    expect(screen.getByRole('link', { name: 'Go back' })).toHaveAttribute('href', '/setlists');
  });

  it('should throw an error if setlist is not found', () => {
    expect(() =>
      render(<EditSetlistPage />, {
        wrapper: MockRouteProvider, // There is no route with :id param
      }),
    ).toThrow('Setlist not found');
  });
});
