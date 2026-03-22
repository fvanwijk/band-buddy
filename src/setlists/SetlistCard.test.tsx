import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { StoreProvider } from '../store/StoreProvider';
import { MockRouteProvider } from '../testUtils';
import { SetlistCard } from './SetlistCard';

describe('SetlistCard', () => {
  const renderComponent = (props = {}) =>
    render(
      <SetlistCard
        date="2026-02-22"
        id="1"
        onActivate={vi.fn()}
        onDelete={vi.fn()}
        setsCount={2}
        songsCount={10}
        title="Test Setlist"
        {...props}
      />,
      {
        wrapper: ({ children }) => (
          <StoreProvider>
            <MockRouteProvider>{children}</MockRouteProvider>
          </StoreProvider>
        ),
      },
    );

  it('renders title, date, sets, and songs', async () => {
    renderComponent();
    expect(await screen.findByText('Test Setlist')).toBeInTheDocument();
    expect(screen.getByText('2 sets')).toBeInTheDocument();
    expect(screen.getByText('10 songs')).toBeInTheDocument();
    expect(screen.getByText('Feb 22, 2026')).toBeInTheDocument();
  });

  it('calls onActivate when play button is clicked', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    renderComponent({ onActivate });

    await user.click(await screen.findByRole('button', { name: 'Activate setlist' }));
    expect(onActivate).toHaveBeenCalled();
  });

  it('shows active state and correct title for active setlist', async () => {
    renderComponent({ isActive: true });

    expect(await screen.findByRole('button', { name: 'Active setlist' })).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderComponent({ onDelete });

    await user.click(await screen.findByRole('button', { name: 'Delete setlist' }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('renders edit button with correct link', async () => {
    renderComponent({ id: '42' });
    expect(await screen.findByRole('link', { name: 'Edit setlist' })).toHaveAttribute(
      'href',
      '/setlists/edit/42',
    );
  });
});
