import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { createCueEvent, createTempoChangeEvent } from '../../../mocks/songEvents';
import { StoreProvider } from '../../../store/StoreProvider';
import { getMockStore } from '../../../testUtils';
import { MetronomeControl } from './MetronomeControl';
import type { MetronomeControlProps } from './MetronomeControl';

const useSequencerTransportMock = vi.fn();
const speakTextMock = vi.fn();

vi.mock('../../../hooks/speakText', () => ({
  speakText: (text: string, options: unknown) => speakTextMock(text, options),
}));

vi.mock('../../../hooks/useSequencerTransport', () => ({
  useSequencerTransport: (args: unknown) => {
    useSequencerTransportMock(args);

    return { currentBeat: 0, currentMeasure: 0 };
  },
}));

describe('MetronomeControl', () => {
  const events = [
    createCueEvent({ beat: 1, id: 'cue-2', measure: 8, text: 'Chorus' }),
    createTempoChangeEvent({ bpm: 100, id: 'tempo-1', measure: 4 }),
    createCueEvent({ beat: 3, id: 'cue-1', measure: 2, text: 'Verse' }),
  ];

  const renderComponent = async (props: Partial<MetronomeControlProps> = {}) => {
    const { persister } = getMockStore();
    await persister.save();

    return render(
      <StoreProvider>
        <MetronomeControl
          bpm={120}
          events={events}
          isReady
          isSupported
          metronomeVolume={50}
          outputs={[]}
          {...props}
        />
      </StoreProvider>,
    );
  };

  const getLastTransportProps = () => useSequencerTransportMock.mock.lastCall?.[0];

  beforeEach(() => {
    useSequencerTransportMock.mockClear();
    speakTextMock.mockReset();
    speakTextMock.mockReturnValue(() => {});
  });

  it('opens a list of the cues in song order on a long press', async () => {
    const user = userEvent.setup();
    await renderComponent();

    await user.pointer({
      keys: '[MouseLeft>]',
      target: await screen.findByTitle('Start metronome, long press to start from cue'),
    });

    const items = await screen.findAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual(['M2:B3Verse', 'M8:B1Chorus']);
  });

  it('starts from the selected cue', async () => {
    const user = userEvent.setup();
    await renderComponent();

    await user.pointer({
      keys: '[MouseLeft>]',
      target: await screen.findByTitle('Start metronome, long press to start from cue'),
    });
    await user.click(await screen.findByRole('menuitem', { name: /Chorus/ }));

    expect(screen.getByTitle('Stop metronome')).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(getLastTransportProps()).toMatchObject({
      isRunning: true,
      startPosition: { beat: 1, measure: 8 },
    });
  });

  it('speaks the cue before the pre count when starting from it', async () => {
    const user = userEvent.setup();
    await renderComponent({ preCountVolume: 80 });

    await user.pointer({
      keys: '[MouseLeft>]',
      target: await screen.findByTitle('Start metronome, long press to start from cue'),
    });
    await user.click(await screen.findByRole('menuitem', { name: /Chorus/ }));

    expect(speakTextMock).toHaveBeenCalledWith(
      'Chorus',
      expect.objectContaining({ language: 'en', volume: 80 }),
    );
    expect(getLastTransportProps()).toMatchObject({ isRunning: false });

    speakTextMock.mock.calls[0][1].onDone();

    expect(await screen.findByTitle('Stop metronome')).toBeInTheDocument();
    await waitFor(() =>
      expect(getLastTransportProps()).toMatchObject({
        isRunning: true,
        startPosition: { beat: 1, measure: 8 },
      }),
    );
  });

  it('opens the list with the context menu', async () => {
    const user = userEvent.setup();
    await renderComponent();

    await user.pointer({
      keys: '[MouseRight]',
      target: await screen.findByTitle('Start metronome, long press to start from cue'),
    });

    expect(await screen.findByRole('menu', { name: 'Start from cue' })).toBeInTheDocument();
  });

  it('starts from the beginning of the song on a normal click', async () => {
    const user = userEvent.setup();
    await renderComponent();

    await user.click(await screen.findByTitle('Start metronome, long press to start from cue'));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(getLastTransportProps()).toMatchObject({ isRunning: true, startPosition: undefined });
  });

  it('does not open a list without cues', async () => {
    const user = userEvent.setup();
    await renderComponent({ events: [createTempoChangeEvent()] });

    await user.pointer({
      keys: '[MouseRight]',
      target: await screen.findByTitle('Start metronome, long press to start from cue'),
    });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the list with escape', async () => {
    const user = userEvent.setup();
    await renderComponent();

    await user.pointer({
      keys: '[MouseRight]',
      target: await screen.findByTitle('Start metronome, long press to start from cue'),
    });
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
