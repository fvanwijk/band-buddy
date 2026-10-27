import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router-dom';
import { describe, expect, it, vi } from 'vite-plus/test';

import { MidiEventLogProvider } from '../../../contexts/MidiEventLogContext';
import { seedStore } from '../../../mocks/seed';
import { StoreProvider } from '../../../store/StoreProvider';
import { getMockStore } from '../../../testUtils';
import { SongDetailPage } from './SongDetailPage';

const useSequencerTransportMock = vi.fn();
const useMidiDevicesMock = vi.fn();

vi.mock('../../../hooks/useSequencerTransport', () => ({
  useSequencerTransport: (args: unknown) => {
    useSequencerTransportMock(args);

    return {
      currentBeat: 0,
      currentMeasure: 0,
    };
  },
}));

vi.mock('../../../midi/useMidiDevices', () => ({
  useMidiDevices: () => useMidiDevicesMock(),
}));

describe('SongDetailPage', () => {
  const allSongDataCells = ['lyrics', 'midiEvents', 'notes', 'sheetMusicFilename'];

  const renderComponent = async ({
    clearedSongCells = [],
    defaultTab,
    songCells = {},
    hideEmptyTabs = false,
    isSupported = true,
    tab,
    triggerState,
    withAutoMidiButtonTrigger = false,
    withSongChangeButton = false,
  }: {
    clearedSongCells?: string[];
    defaultTab?: 'lyrics' | 'midi' | 'text-notes' | 'sheet-music';
    hideEmptyTabs?: boolean;
    isSupported?: boolean;
    songCells?: Record<string, string>;
    tab?: string;
    triggerState?: { triggerMidi: boolean };
    withAutoMidiButtonTrigger?: boolean;
    withSongChangeButton?: boolean;
  } = {}) => {
    const sendProgramChangeMock = vi.fn();
    const { store, persister } = getMockStore();
    seedStore(store);
    if (defaultTab) {
      store.setPartialRow('songs', '0', { defaultTab });
    }
    if (hideEmptyTabs) {
      store.setValue('hideEmptyTabs', true);
    }
    clearedSongCells.forEach((cell) => store.delCell('songs', '0', cell));
    store.setPartialRow('songs', '0', songCells);
    if (withAutoMidiButtonTrigger) {
      const songRow = store.getRow('songs', '0') as Record<string, unknown>;
      const midiEvents = JSON.parse(String(songRow.midiEvents)) as Array<{
        id: string;
        label: string;
      }>;
      const targetMidiEvent = midiEvents.find((event) => event.label === 'Organ') ?? midiEvents[0];

      store.setPartialRow('songs', '0', {
        events: JSON.stringify([
          {
            beat: 1,
            id: 'trigger-1',
            measure: 1,
            midiEventId: targetMidiEvent.id,
            type: 'midiButton',
          },
        ]),
      });
    }
    if (withSongChangeButton) {
      const songRow = store.getRow('songs', '0') as Record<string, unknown>;
      const midiEvents = (JSON.parse(String(songRow.midiEvents)) as Array<{ label: string }>).map(
        (event) => (event.label === 'Organ' ? { ...event, triggerOnSongChange: true } : event),
      );
      store.setPartialRow('songs', '0', { midiEvents: JSON.stringify(midiEvents) });
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

    render(<RoutesStub initialEntries={[{ pathname: route, state: triggerState }]} />, {
      wrapper: ({ children }) => (
        <StoreProvider>
          <MidiEventLogProvider>{children}</MidiEventLogProvider>
        </StoreProvider>
      ),
    });

    return { sendProgramChangeMock };
  };

  it('renders current song and next navigation button', async () => {
    await renderComponent();

    expect(await screen.findByText('Bohemian Rhapsody')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'September' })).toHaveAttribute('href', '/play/0/1');
  });

  it('sends song change MIDI buttons when the song was selected explicitly', async () => {
    const { sendProgramChangeMock } = await renderComponent({
      triggerState: { triggerMidi: true },
      withSongChangeButton: true,
    });

    await waitFor(() => {
      expect(sendProgramChangeMock).toHaveBeenCalledWith(12, { channels: [1] });
    });
    expect(sendProgramChangeMock).toHaveBeenCalledTimes(1);
  });

  it('does not send song change MIDI buttons without the explicit selection state', async () => {
    const { sendProgramChangeMock } = await renderComponent({ withSongChangeButton: true });

    expect(await screen.findByText('Bohemian Rhapsody')).toBeInTheDocument();
    expect(sendProgramChangeMock).not.toHaveBeenCalled();
  });

  it('toggles metronome button title when clicked', async () => {
    const user = userEvent.setup();

    await renderComponent();

    expect(await screen.findByText('M0:B0')).toBeInTheDocument();

    await user.click(await screen.findByTitle('Start metronome'));

    expect(screen.getByTitle('Stop metronome')).toBeInTheDocument();
  });

  it('triggers MIDI program change when device is available', async () => {
    const user = userEvent.setup();
    const { sendProgramChangeMock } = await renderComponent({ tab: 'midi' });

    await user.click(await screen.findByRole('button', { name: 'Organ' }));

    expect(sendProgramChangeMock).toHaveBeenCalledWith(12, { channels: [1] });
  });

  it('disables midi buttons when MIDI is not supported', async () => {
    await renderComponent({ isSupported: false, tab: 'midi' });

    expect(await screen.findByRole('button', { name: 'Organ' })).toBeDisabled();
  });

  it('uses explicit route tab even when default tab differs', async () => {
    await renderComponent({ defaultTab: 'midi', tab: 'text-notes' });

    expect(
      await screen.findByRole('tab', { name: 'Text notes', selected: true }),
    ).toBeInTheDocument();
  });

  it('hides tabs without data when hide empty tabs is enabled', async () => {
    await renderComponent({ clearedSongCells: ['sheetMusicFilename'], hideEmptyTabs: true });

    expect(await screen.findByRole('tab', { name: 'Lyrics' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Sheet Music' })).not.toBeInTheDocument();
  });

  it('keeps the text notes tab when hide empty tabs is enabled and there are only drawings', async () => {
    const stroke = { drawMode: true, paths: [{ x: 1, y: 1 }], strokeColor: '#fff', strokeWidth: 2 };
    await renderComponent({
      clearedSongCells: allSongDataCells,
      hideEmptyTabs: true,
      songCells: { textNotesCanvasPaths: JSON.stringify([stroke]) },
    });

    expect(await screen.findByRole('tab', { name: 'Text notes' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(1);
  });

  it('shows an empty state when hide empty tabs is enabled and no tab has data', async () => {
    await renderComponent({ clearedSongCells: allSongDataCells, hideEmptyTabs: true });

    expect(await screen.findByText(/No tabs with data/)).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('shows all tabs when hide empty tabs is disabled and no tab has data', async () => {
    await renderComponent({ clearedSongCells: allSongDataCells });

    expect(await screen.findAllByRole('tab')).toHaveLength(4);
  });

  it('highlights triggered MIDI button and fades in 1.5 seconds', async () => {
    const user = userEvent.setup();

    await renderComponent({ tab: 'midi' });

    await user.click(await screen.findByRole('button', { name: 'Organ' }));

    const organButton = await screen.findByRole('button', { name: 'Organ' });
    expect(organButton.className).toContain('ring-brand-300/80');

    await waitFor(
      () => {
        expect(organButton.className).not.toContain('ring-brand-300/80');
      },
      { timeout: 1800 },
    );
  });
});
