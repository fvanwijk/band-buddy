import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

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

  describe('floating button', () => {
    const START_TITLE = 'Start metronome, long press to start from cue';
    let reportVisibility: (ratio: number) => void;

    beforeEach(() => {
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor(callback: (entries: { intersectionRatio: number }[]) => void) {
            reportVisibility = (ratio) => callback([{ intersectionRatio: ratio }]);
          }
          disconnect() {}
          observe() {}
        },
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    const renderWithSlot = async () => {
      const slot = document.createElement('div');
      document.body.append(slot);
      await renderComponent({ floatingSlot: slot });

      return slot;
    };

    it('does not render in the slot while the inline button is fully visible', async () => {
      const slot = await renderWithSlot();
      await screen.findByTitle(START_TITLE);

      expect(slot).toBeEmptyDOMElement();
    });

    it('fades in while the inline button scrolls out of view', async () => {
      const slot = await renderWithSlot();
      await screen.findByTitle(START_TITLE);

      act(() => reportVisibility(0.25));

      const floatingButton = within(slot).getByTitle(START_TITLE);
      expect(floatingButton.parentElement).toHaveStyle({ opacity: '0.75' });

      act(() => reportVisibility(0));

      expect(floatingButton.parentElement).toHaveStyle({ opacity: '1' });
    });

    it('does not render in the slot when there is none', async () => {
      await renderComponent();
      await screen.findByTitle(START_TITLE);

      act(() => reportVisibility(0));

      expect(screen.getAllByTitle(START_TITLE)).toHaveLength(1);
    });

    it('starts the metronome from the floating button', async () => {
      const user = userEvent.setup();
      const slot = await renderWithSlot();
      await screen.findByTitle(START_TITLE);
      act(() => reportVisibility(0));

      await user.click(within(slot).getByTitle(START_TITLE));

      await waitFor(() => expect(getLastTransportProps().isRunning).toBe(true));
    });

    it('opens the cue menu next to the floating button only', async () => {
      const user = userEvent.setup();
      const slot = await renderWithSlot();
      await screen.findByTitle(START_TITLE);
      act(() => reportVisibility(0));

      await user.pointer({ keys: '[MouseRight]', target: within(slot).getByTitle(START_TITLE) });

      expect(await screen.findAllByRole('menu')).toHaveLength(1);
      expect(within(slot).getByRole('menu')).toBeInTheDocument();
    });
  });
});
