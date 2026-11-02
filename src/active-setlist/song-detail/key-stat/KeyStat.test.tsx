import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vite-plus/test';

import { createSong, createSongTable } from '../../../mocks/songs';
import { StoreProvider } from '../../../store/StoreProvider';
import { getMockStore } from '../../../testUtils';
import { KeyStat } from './KeyStat';

describe('KeyStat', () => {
  const getPersistedTranspose = () => {
    const [tables] = JSON.parse(localStorage.getItem('band-buddy') ?? '[]');
    return tables.songs['1'].transpose;
  };

  const renderComponent = async (transpose?: number) => {
    const song = createSong({ id: '1', key: 'F#', transpose });
    const { store, persister } = getMockStore();
    store.setRow('songs', song.id, createSongTable({ key: 'F#', transpose }));
    await persister.save();

    render(
      <StoreProvider>
        <KeyStat keyName="F#" song={song} />
      </StoreProvider>,
    );
    return screen.findByRole('spinbutton', { name: 'Transpose' });
  };

  beforeAll(() => {
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
    HTMLElement.prototype.hasPointerCapture = () => true;
  });

  it('renders the key with its transpose', async () => {
    await renderComponent(-1);

    expect(screen.getByText('F#')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  it('transposes down when dragging down', async () => {
    const user = userEvent.setup();
    const stat = await renderComponent();

    await user.pointer([
      { coords: { clientY: 100 }, keys: '[MouseLeft>]', target: stat },
      { coords: { clientY: 124 } },
      { keys: '[/MouseLeft]' },
    ]);

    expect(getPersistedTranspose()).toBe(-1);
  });

  it('transposes up when dragging up', async () => {
    const user = userEvent.setup();
    const stat = await renderComponent(1);

    await user.pointer([
      { coords: { clientY: 100 }, keys: '[MouseLeft>]', target: stat },
      { coords: { clientY: 52 } },
      { keys: '[/MouseLeft]' },
    ]);

    expect(getPersistedTranspose()).toBe(3);
  });

  it('transposes with arrow keys', async () => {
    const user = userEvent.setup();
    const stat = await renderComponent();

    stat.focus();
    await user.keyboard('{ArrowDown}');

    expect(getPersistedTranspose()).toBe(-1);
  });
});
