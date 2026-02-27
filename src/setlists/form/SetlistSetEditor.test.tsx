import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { type Mock, describe, expect, it, vi } from 'vitest';

import type { SetlistFormData } from './SetlistForm';
import { SetlistSetEditor } from './SetlistSetEditor';
import { seedSongs } from '../../mocks/seed';
import { createSetlistSetsWithSongs } from '../../mocks/setlistSets';
import { createSongsTable } from '../../mocks/songs';
import { StoreProvider } from '../../store/StoreProvider';
import { getMockStore } from '../../testUtils';

const Providers: FC<{ children: React.ReactNode | React.ReactNode[] }> = (props) => (
  <StoreProvider>
    <FormProvider
      {...useForm<SetlistFormData>({ defaultValues: { sets: createSetlistSetsWithSongs() } })}
      {...props}
    />
  </StoreProvider>
);

// Adding/deleting sets and songs is already tested in the SetlistForm tests
describe('SetlistSetEditor', () => {
  const renderComponent = async (onSubmitMock?: Mock) => {
    const { store, persister } = getMockStore();
    // Bohemian Rhapsody, September, Superstition, Billie Jean, etc...
    await seedSongs(store);
    await persister.save();

    return render(<SetlistSetEditor index={0} onRemove={() => {}} showRemove={false} />, {
      wrapper: ({ children }) => (
        <Providers>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formdata = new FormData(event.target);
              return onSubmitMock?.(Object.fromEntries(formdata.entries()));
            }}
          >
            {children}
            <button type="submit">Submit</button>
          </form>
        </Providers>
      ),
    });
  };

  it('should rename the set', async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();
    renderComponent(onSubmitMock);

    await user.click(await screen.findByRole('button', { name: 'Edit set name for Set 1' }));
    await user.type(await screen.findByLabelText('Set name'), 'New set name[Tab]');

    expect(
      screen.getByRole('button', { name: 'Edit set name for New set name' }),
    ).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Submit' }));

    // FIXME: use handleSubmit() or watch() instead of new FormData(event.target), because I also want to assert invisible fields
    expect(onSubmitMock).toHaveBeenCalledWith({
      'sets.0.songs.0.songId': '0',
      'sets.0.songs.1.songId': '1',
      'sets.0.songs.2.songId': '2',
    });
  });

  it('should change songs of the set', async () => {
    const user = userEvent.setup();

    const onSubmitMock = vi.fn();
    renderComponent(onSubmitMock);

    await user.selectOptions(
      await screen.findByLabelText('Song 1 of Set 1'),
      'Michael Jackson - Billie Jean',
    );

    await user.click(await screen.findByRole('button', { name: 'Submit' }));

    expect(onSubmitMock).toHaveBeenCalledWith({
      'sets.0.songs.0.songId': '3', // Was 0
      'sets.0.songs.1.songId': '1',
      'sets.0.songs.2.songId': '2',
    });
  });

  it('should reorder songs of the set', async () => {
    const user = userEvent.setup();

    const onSubmitMock = vi.fn();
    renderComponent(onSubmitMock);

    // The first set has 3 (deleted) songs, only the first song cannot be moved up, the last song can be moved down to the next set
    const moveUpButtons = await screen.findAllByRole('button', { name: 'Move up' });
    expect(moveUpButtons).toHaveLength(3);
    expect(moveUpButtons[0]).toBeDisabled();
    expect(moveUpButtons[1]).not.toBeDisabled();
    expect(moveUpButtons[2]).not.toBeDisabled();

    const moveDownButtons = screen.getAllByRole('button', { name: 'Move down' });
    expect(moveDownButtons).toHaveLength(3);
    expect(moveDownButtons[0]).not.toBeDisabled();
    expect(moveDownButtons[1]).not.toBeDisabled();
    expect(moveDownButtons[2]).not.toBeDisabled();

    // Swap 2 and 3
    await user.click(moveDownButtons[1]);
    await user.click(await screen.findByRole('button', { name: 'Submit' }));
    expect(onSubmitMock).toHaveBeenCalledWith({
      'sets.0.songs.0.songId': '0',
      'sets.0.songs.1.songId': '2',
      'sets.0.songs.2.songId': '1',
    });

    // Swap back with other button
    await user.click(moveUpButtons[2]);
    await user.click(await screen.findByRole('button', { name: 'Submit' }));
    expect(onSubmitMock).toHaveBeenCalledWith({
      'sets.0.songs.0.songId': '0',
      'sets.0.songs.1.songId': '1',
      'sets.0.songs.2.songId': '2',
    });

    // Move last song to next set
    await user.click(moveDownButtons[2]);
    await user.click(await screen.findByRole('button', { name: 'Submit' }));
    // sets.1.* fields are not submitted because there are no fields rendered for the second set
    // TODO: find a way to assert the form state after the move instead of relying on the submitted form data, which doesn't include the second set's songs after the move
    expect(onSubmitMock).toHaveBeenCalledWith({
      'sets.0.songs.0.songId': '0',
      'sets.0.songs.1.songId': '1',
    });
  });

  it('should render deleted songs', async () => {
    render(<SetlistSetEditor index={0} onRemove={() => {}} showRemove={false} />, {
      wrapper: Providers,
    });

    expect(await screen.findAllByText('[Deleted song]')).toHaveLength(3);
    expect(screen.queryByText('Queen - Bohemian Rhapsody')).not.toBeInTheDocument();
  });

  it('should render soft deleted songs', async () => {
    const { store, persister } = getMockStore();
    await Promise.all(
      createSongsTable().map((song, i) =>
        store.setRow('songs', i.toString(), { ...song, isDeleted: true }),
      ),
    );
    await persister.save();

    render(<SetlistSetEditor index={0} onRemove={() => {}} showRemove={false} />, {
      wrapper: Providers,
    });

    expect(await screen.findByText('Queen - Bohemian Rhapsody')).toBeInTheDocument();
    expect(screen.getAllByText('(Deleted)')).toHaveLength(3);
  });
});
