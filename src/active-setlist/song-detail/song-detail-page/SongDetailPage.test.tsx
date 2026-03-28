import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router-dom';
import { describe, expect, it, vi } from 'vite-plus/test';

import { seedStore } from '../../../mocks/seed';
import { StoreProvider } from '../../../store/StoreProvider';
import { getMockStore } from '../../../testUtils';
import { SongDetailPage } from './SongDetailPage';

const useMetronomeMock = vi.fn();
const useMidiDevicesMock = vi.fn();

vi.mock('../../../hooks/useMetronome', () => ({
  useMetronome: (args: unknown) => useMetronomeMock(args),
}));

vi.mock('../../../midi/useMidiDevices', () => ({
  useMidiDevices: () => useMidiDevicesMock(),
}));

describe('SongDetailPage', () => {
  const renderComponent = async ({
    defaultTab,
    isSupported = true,
    tab,
  }: {
    defaultTab?: 'lyrics' | 'midi' | 'notes' | 'sheet-music';
    isSupported?: boolean;
    tab?: string;
  } = {}) => {
    const sendProgramChangeMock = vi.fn();
    const { store, persister } = getMockStore();
    seedStore(store);
    if (defaultTab) {
      store.setPartialRow('songs', '0', { defaultTab });
    }
    store.setValue('activeSetlistId', '1');
    await persister.save();

    useMidiDevicesMock.mockReturnValue({
      error: null,
      inputs: [],
      isReady: true,
      isSupported,
      outputs: [{ id: '1', sendProgramChange: sendProgramChangeMock }],
    });

    const RoutesStub = createRoutesStub([
      {
        Component: () => <SongDetailPage />,
        path: '/play/:setlistId/:setlistSongId/:tab?',
      },
    ]);

    const route = tab ? `/play/0/0/${tab}` : '/play/0/0';

    render(<RoutesStub initialEntries={[route]} />, {
      wrapper: StoreProvider,
    });

    return { sendProgramChangeMock };
  };

  it('renders current song and next navigation button', async () => {
    await renderComponent();

    expect(await screen.findByText('Bohemian Rhapsody')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'September' })).toHaveAttribute('href', '/play/0/1');
  });

  it('toggles metronome button title when clicked', async () => {
    const user = userEvent.setup();

    await renderComponent();

    await user.click(await screen.findByTitle('Start metronome'));

    expect(screen.getByTitle('Stop metronome')).toBeInTheDocument();
  });

  it('updates notes in store when notes field changes', async () => {
    const user = userEvent.setup();
    await renderComponent();

    await user.click(await screen.findByRole('tab', { name: 'Notes' }));

    const notesField = screen.getAllByLabelText('Notes')[1];

    await user.clear(notesField);
    await user.type(notesField, 'Act like a rock star while playing this song');

    expect(JSON.parse(localStorage.getItem('band-buddy')!)[0].songs[0].notes).toBe(
      'Act like a rock star while playing this song',
    );
  });

  it('triggers MIDI program change when device is available', async () => {
    const user = userEvent.setup();
    const { sendProgramChangeMock } = await renderComponent({ tab: 'midi' });

    await user.click(await screen.findByRole('button', { name: 'Organ' }));

    expect(sendProgramChangeMock).toHaveBeenCalledWith(12);
  });

  it('disables midi buttons when MIDI is not supported', async () => {
    await renderComponent({ isSupported: false, tab: 'midi' });

    expect(await screen.findByRole('button', { name: 'Organ' })).toBeDisabled();
  });

  it('uses explicit route tab even when default tab differs', async () => {
    await renderComponent({ defaultTab: 'midi', tab: 'notes' });

    expect(await screen.findByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument();
  });
});
