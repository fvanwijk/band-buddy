import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vite-plus/test';

import { createSong, createSongTable } from '../../../mocks/songs';
import { StoreProvider } from '../../../store/StoreProvider';
import { getMockStore } from '../../../testUtils';
import { BpmStat } from './BpmStat';

describe('BpmStat', () => {
  const song = createSong({ bpm: 100, id: '1' });

  const getPersistedBpm = () => {
    const [tables] = JSON.parse(localStorage.getItem('band-buddy') ?? '[]');
    return tables.songs['1'].bpm;
  };

  const renderComponent = async () => {
    const { store, persister } = getMockStore();
    store.setRow('songs', song.id, createSongTable({ bpm: 100 }));
    await persister.save();

    render(
      <StoreProvider>
        <BpmStat bpm={100} song={song} />
      </StoreProvider>,
    );
    return screen.findByRole('spinbutton', { name: 'BPM' });
  };

  beforeAll(() => {
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
    HTMLElement.prototype.hasPointerCapture = () => true;
  });

  it('renders the BPM value', async () => {
    const stat = await renderComponent();

    expect(stat).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('saves an incremented BPM when dragging up', async () => {
    const user = userEvent.setup();
    const stat = await renderComponent();

    await user.pointer([
      { coords: { clientY: 100 }, keys: '[MouseLeft>]', target: stat },
      { coords: { clientY: 76 } },
      { keys: '[/MouseLeft]' },
    ]);

    expect(getPersistedBpm()).toBe(104);
  });

  it('saves a decremented BPM when dragging down', async () => {
    const user = userEvent.setup();
    const stat = await renderComponent();

    await user.pointer([
      { coords: { clientY: 100 }, keys: '[MouseLeft>]', target: stat },
      { coords: { clientY: 118 } },
      { keys: '[/MouseLeft]' },
    ]);

    expect(getPersistedBpm()).toBe(97);
  });

  it('highlights the value only while dragging', async () => {
    const user = userEvent.setup();
    const stat = await renderComponent();

    await user.pointer({ keys: '[MouseLeft>]', target: stat });
    expect(screen.getByText('100')).toHaveClass('text-brand-400');

    await user.pointer({ keys: '[/MouseLeft]' });
    expect(screen.getByText('100')).not.toHaveClass('text-brand-400');
  });

  it('does not save when moving without pressing', async () => {
    const user = userEvent.setup();
    const stat = await renderComponent();

    await user.pointer([{ coords: { clientY: 100 }, target: stat }, { coords: { clientY: 50 } }]);

    expect(getPersistedBpm()).toBe(100);
  });

  it('changes BPM with arrow keys', async () => {
    const user = userEvent.setup();
    const stat = await renderComponent();

    stat.focus();
    await user.keyboard('{ArrowUp}');

    expect(getPersistedBpm()).toBe(101);
  });
});
