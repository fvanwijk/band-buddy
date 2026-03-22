import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { seedSongs } from '../../mocks/seed';
import { createSetlist } from '../../mocks/setlists';
import { StoreProvider } from '../../store/StoreProvider';
import { MockRouteProvider, getMockStore } from '../../testUtils';
import { SetlistForm, type SetlistFormProps } from './SetlistForm';

describe('SetlistForm', () => {
  const renderComponent = (props: Partial<SetlistFormProps> = {}) =>
    render(
      <SetlistForm backPath="/setlists" onSubmit={vi.fn()} title="Add new setlist" {...props} />,
      {
        wrapper: ({ children }) => (
          <StoreProvider>
            <MockRouteProvider>{children}</MockRouteProvider>
          </StoreProvider>
        ),
      },
    );

  it('should render a back link and title', async () => {
    renderComponent();
    expect(await screen.findByRole('link', { name: 'Go back' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add new setlist' })).toBeInTheDocument();
  });

  it('should render a warning when there are no songs to add', async () => {
    renderComponent();
    expect(await screen.findByText(/You don't have songs in your library/)).toBeInTheDocument();
  });

  it('should fill in the form and submit it', async () => {
    const { store, persister } = getMockStore();
    seedSongs(store);
    await persister.save();

    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderComponent({ onSubmit });

    // There are songs seeded
    expect(screen.queryByText(/You don't have songs in your library/)).not.toBeInTheDocument();

    // Validation
    await user.clear(await screen.findByLabelText('Performance date*'));
    await user.click(screen.getByRole('button', { name: 'Create setlist' }));

    expect(screen.getByText('Setlist title is required')).toBeInTheDocument();
    expect(screen.getByText('Date is required')).toBeInTheDocument();

    // Basic info
    await user.type(screen.getByLabelText('Setlist title*'), 'Test Setlist');
    await user.type(screen.getByLabelText('Performance date*'), '2026-02-22');
    await user.type(screen.getByLabelText('Venue'), 'Test Venue');

    // Set 1
    await user.click(screen.getByRole('button', { name: 'Add set' }));
    expect(screen.queryByRole('button', { name: 'Remove set' })).not.toBeInTheDocument(); // Only when there are 2 or more sets
    await user.click(screen.getByRole('button', { name: 'Edit set name for Set 1' }));
    await user.type(screen.getByLabelText('Set name'), 'Opening set');
    await user.click(screen.getByRole('button', { name: 'Add song to set' }));
    await user.click(screen.getByRole('button', { name: 'Delete song' }));
    await user.click(screen.getByRole('button', { name: 'Add song to set' }));

    // Set 2
    await user.click(screen.getByRole('button', { name: 'Add set' }));
    await user.click(screen.getAllByRole('button', { name: 'Remove set' })[1]);
    await user.click(screen.getByRole('button', { name: 'Add set' }));

    await user.click(screen.getByRole('button', { name: 'Create setlist' }));

    expect(onSubmit).toHaveBeenCalledWith({
      date: '2026-02-22',
      sets: [
        {
          name: 'Opening set',
          setIndex: 1,
          setlistId: '',
          songs: [{ setId: '', songId: '3', songIndex: 0 }],
        },
        {
          name: '',
          setIndex: 2,
          setlistId: '',
          songs: [],
        },
      ],
      title: 'Test Setlist',
      venue: 'Test Venue',
    });
  });

  it('should fill the form with existing setlist data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const initialData = { ...createSetlist(), sets: [] };

    renderComponent({
      initialData,
      onSubmit,
      title: 'Edit setlist',
    });

    expect(await screen.findByRole('heading', { name: 'Edit setlist' })).toBeInTheDocument();

    expect(screen.getByLabelText('Setlist title*')).toHaveValue(initialData.title);
    expect(screen.getByLabelText('Performance date*')).toHaveValue(initialData.date);
    expect(screen.getByLabelText('Venue')).toHaveValue(initialData.venue);

    await user.click(await screen.findByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith(initialData);
  });
});
