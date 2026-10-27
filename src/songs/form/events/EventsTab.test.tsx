import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { FC } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';

import {
  createCueEvent,
  createMidiButtonEvent,
  createTempoChangeEvent,
  createTimeSignatureChangeEvent,
} from '../../../mocks/songEvents';
import { createMidiEvents } from '../../../mocks/songs';
import type { MidiEvent, SongEvent } from '../../../types';
import { EventsTab } from './EventsTab';

type HarnessProps = {
  bpm?: number;
  initialEvents?: SongEvent[];
  midiEvents?: MidiEvent[];
  onEventsChange?: (events: SongEvent[]) => void;
  timeSignature?: string;
};

// Holds the events like the song form does
const Harness: FC<HarnessProps> = ({
  bpm = 72,
  initialEvents = [],
  midiEvents = createMidiEvents(),
  onEventsChange,
  timeSignature = '4/4',
}) => {
  const [events, setEvents] = useState(initialEvents);

  return (
    <EventsTab
      bpm={bpm}
      events={events}
      midiEvents={midiEvents}
      onEventsChange={(nextEvents) => {
        setEvents(nextEvents);
        onEventsChange?.(nextEvents);
      }}
      timeSignature={timeSignature}
    />
  );
};

describe('EventsTab', () => {
  const renderComponent = (props: HarnessProps = {}) => render(<Harness {...props} />);

  const getGroup = (name: string) => within(screen.getByRole('region', { name }));

  it('shows an empty state', () => {
    renderComponent();

    expect(screen.getByText('No events yet.')).toBeInTheDocument();
  });

  it('adds a cue on the first measure and edits its text', async () => {
    const user = userEvent.setup();
    const onEventsChange = vi.fn();
    renderComponent({ onEventsChange });

    await user.click(screen.getByRole('button', { name: 'Add cue' }));
    const group = getGroup('Measure 1, beat 1');
    await user.type(group.getByLabelText('Cue text'), 'Verse');

    expect(group.getByLabelText('Cue text')).toHaveValue('Verse');
    expect(onEventsChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ beat: 1, measure: 1, text: 'Verse', type: 'cue' }),
    ]);
  });

  it('adds a tempo change on beat 1 of the second measure with the song tempo', async () => {
    const user = userEvent.setup();
    renderComponent({ bpm: 90 });

    await user.click(screen.getByRole('button', { name: 'Add tempo change' }));
    const group = getGroup('Measure 2, beat 1');

    expect(group.getByLabelText('Tempo (BPM)')).toHaveValue(90);
    expect(group.getByLabelText('Beat')).toBeDisabled();
    expect(group.getByText('Changes are always on beat 1')).toBeInTheDocument();
  });

  it('adds a time signature change with another signature than the song', async () => {
    const user = userEvent.setup();
    renderComponent({ timeSignature: '4/4' });

    await user.click(screen.getByRole('button', { name: 'Add time signature change' }));

    expect(
      getGroup('Measure 2, beat 1').getByRole('combobox', { name: 'Time signature' }),
    ).toHaveValue('3/4');
  });

  it('adds a new position after the last event', async () => {
    const user = userEvent.setup();
    renderComponent({ initialEvents: [createCueEvent({ measure: 6 })] });

    await user.click(screen.getByRole('button', { name: 'Add MIDI button' }));

    expect(screen.getByRole('region', { name: 'Measure 7, beat 1' })).toBeInTheDocument();
  });

  it('adds several events to one position', async () => {
    const user = userEvent.setup();
    renderComponent({ initialEvents: [createTempoChangeEvent({ measure: 3 })] });
    const group = getGroup('Measure 3, beat 1');

    await user.click(group.getByRole('button', { name: 'Add cue to measure 3, beat 1' }));
    await user.click(group.getByRole('button', { name: 'Add MIDI button to measure 3, beat 1' }));
    await user.click(group.getByRole('button', { name: 'Add MIDI button to measure 3, beat 1' }));

    expect(group.getAllByRole('combobox', { name: 'MIDI button' })).toHaveLength(2);
    expect(group.getByLabelText('Cue text')).toBeInTheDocument();
    expect(group.getByLabelText('Tempo (BPM)')).toBeInTheDocument();
  });

  it('disables types that are not possible at a position', async () => {
    renderComponent({
      initialEvents: [
        createTempoChangeEvent({ measure: 3 }),
        createCueEvent({ beat: 1, id: 'cue', measure: 3 }),
        createCueEvent({ beat: 3, id: 'later', measure: 3 }),
        createCueEvent({ beat: 1, id: 'first', measure: 1 }),
      ],
    });

    const atChange = getGroup('Measure 3, beat 1');
    expect(atChange.getByRole('button', { name: /Add cue/ })).toBeDisabled();
    expect(atChange.getByRole('button', { name: /Add tempo change/ })).toBeDisabled();
    expect(atChange.getByRole('button', { name: /Add time signature change/ })).toBeEnabled();

    const offBeat = getGroup('Measure 3, beat 3');
    expect(offBeat.getByRole('button', { name: /Add tempo change/ })).toBeDisabled();
    expect(offBeat.getByRole('button', { name: /Add tempo change/ })).toHaveAttribute(
      'title',
      'Changes are always on beat 1',
    );

    const firstMeasure = getGroup('Measure 1, beat 1');
    expect(firstMeasure.getByRole('button', { name: /Add time signature change/ })).toBeDisabled();
  });

  it('needs a MIDI button to add a MIDI button event', () => {
    renderComponent({ midiEvents: [] });

    expect(screen.getByRole('button', { name: 'Add MIDI button' })).toBeDisabled();
    expect(screen.getByText(/Create a MIDI button on the MIDI buttons tab/)).toBeInTheDocument();
  });

  it('moves all events of a position to another measure', async () => {
    const user = userEvent.setup();
    renderComponent({
      initialEvents: [
        createCueEvent({ beat: 1, id: 'cue', measure: 3, text: 'Chorus' }),
        createMidiButtonEvent({ beat: 1, id: 'midi', measure: 3 }),
        createCueEvent({ beat: 1, id: 'other', measure: 8, text: 'Outro' }),
      ],
    });

    const measure = getGroup('Measure 3, beat 1').getByLabelText('Measure');
    await user.clear(measure);
    await user.type(measure, '5');
    await user.tab();

    const moved = getGroup('Measure 5, beat 1');
    expect(moved.getByLabelText('Cue text')).toHaveValue('Chorus');
    expect(moved.getByRole('combobox', { name: 'MIDI button' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Measure 3, beat 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Measure 8, beat 1' })).toBeInTheDocument();
  });

  it('keeps the position when the measure is emptied', async () => {
    const user = userEvent.setup();
    renderComponent({ initialEvents: [createCueEvent({ measure: 3 })] });

    const measure = getGroup('Measure 3, beat 1').getByLabelText('Measure');
    await user.clear(measure);
    await user.tab();

    expect(measure).toHaveValue(3);
    expect(screen.getByRole('region', { name: 'Measure 3, beat 1' })).toBeInTheDocument();
  });

  it('moves a group without changes to another beat', async () => {
    const user = userEvent.setup();
    renderComponent({ initialEvents: [createMidiButtonEvent({ beat: 1, measure: 2 })] });

    const beat = getGroup('Measure 2, beat 1').getByLabelText('Beat');
    await user.clear(beat);
    await user.type(beat, '3');
    await user.tab();

    expect(screen.getByRole('region', { name: 'Measure 2, beat 3' })).toBeInTheDocument();
  });

  it('limits the tempo to 300 BPM', async () => {
    const user = userEvent.setup();
    const onEventsChange = vi.fn();
    renderComponent({ initialEvents: [createTempoChangeEvent()], onEventsChange });

    const bpm = screen.getByLabelText('Tempo (BPM)');
    await user.clear(bpm);
    await user.type(bpm, '500');
    await user.tab();

    expect(bpm).toHaveValue(300);
    expect(onEventsChange).toHaveBeenLastCalledWith([expect.objectContaining({ bpm: 300 })]);
  });

  it('changes the time signature and the MIDI button of events', async () => {
    const user = userEvent.setup();
    const onEventsChange = vi.fn();
    renderComponent({
      initialEvents: [
        createTimeSignatureChangeEvent({ measure: 2, timeSignature: '3/4' }),
        createMidiButtonEvent({ beat: 2, measure: 4, midiEventId: '1' }),
      ],
      onEventsChange,
    });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Time signature' }), '6/8');
    await user.selectOptions(screen.getByRole('combobox', { name: 'MIDI button' }), 'EP');

    expect(onEventsChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ timeSignature: '6/8', type: 'timeSignatureChange' }),
      expect.objectContaining({ midiEventId: '2', type: 'midiButton' }),
    ]);
  });

  it('deletes an event and the position when it is empty', async () => {
    const user = userEvent.setup();
    renderComponent({ initialEvents: [createCueEvent({ measure: 3, text: 'Verse' })] });

    await user.click(screen.getByRole('button', { name: 'Delete cue' }));

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByText('No events yet.')).toBeInTheDocument();
  });

  it('shows problems with events', () => {
    renderComponent({
      initialEvents: [
        createCueEvent({ id: 'empty', text: '' }),
        createTempoChangeEvent({ bpm: 100, measure: 3 }),
        createCueEvent({ beat: 3, id: 'during', measure: 2, text: 'Oops' }),
      ],
    });

    expect(screen.getByText('A cue needs text to speak')).toBeInTheDocument();
    expect(screen.getByText('This cue is spoken during a count-in')).toBeInTheDocument();
  });

  it('asks for a BPM when the song has none', () => {
    render(<EventsTab events={[]} midiEvents={[]} onEventsChange={vi.fn()} timeSignature="4/4" />);

    expect(screen.getByText(/Set a BPM on the song details tab/)).toBeInTheDocument();
  });

  describe('timeline view', () => {
    const openTimeline = async (props: HarnessProps = {}) => {
      const user = userEvent.setup();
      renderComponent(props);
      await user.click(screen.getByRole('button', { name: 'Timeline' }));
      return user;
    };

    const getMeasure = (measure: number) =>
      within(screen.getByRole('group', { name: `Measure ${measure}` }));

    // jsdom has no drag and drop, so the events are fired with a minimal data transfer
    const createDataTransfer = () => {
      const data: Record<string, string> = {};
      return {
        effectAllowed: '',
        getData: (type: string) => data[type],
        setData: (type: string, value: string) => {
          data[type] = value;
        },
      };
    };

    const drag = (chip: HTMLElement, target: HTMLElement) => {
      const dataTransfer = createDataTransfer();

      fireEvent.dragStart(chip, { dataTransfer });
      fireEvent.dragOver(target, { dataTransfer });
      fireEvent.drop(target, { dataTransfer });
    };

    const getMeasureElement = (measure: number) =>
      screen.getByRole('group', { name: `Measure ${measure}` });
    const getBeatElement = (measure: number, beat: number) =>
      screen.getByRole('button', { name: `Select measure ${measure}, beat ${beat}` });

    describe('drop zones', () => {
      const dragStart = (chip: HTMLElement) =>
        fireEvent.dragStart(chip, { dataTransfer: createDataTransfer() });

      it('shows the beats as drop zones while dragging a cue or MIDI button', async () => {
        await openTimeline({
          initialEvents: [
            createCueEvent({ beat: 2, id: 'cue', measure: 2, text: 'Verse' }),
            createMidiButtonEvent({ beat: 1, id: 'midi', measure: 3, midiEventId: '1' }),
          ],
        });

        expect(getBeatElement(5, 3)).not.toHaveAttribute('data-drop-zone');

        dragStart(getMeasure(2).getByRole('button', { name: '2 · Verse' }));

        expect(getBeatElement(5, 3)).toHaveAttribute('data-drop-zone', 'true');
        expect(getBeatElement(1, 1)).toHaveAttribute('data-drop-zone', 'true');
        expect(getMeasureElement(5)).not.toHaveAttribute('data-drop-zone');

        fireEvent.dragEnd(getMeasure(2).getByRole('button', { name: '2 · Verse' }));
        expect(getBeatElement(5, 3)).not.toHaveAttribute('data-drop-zone');

        dragStart(getMeasure(3).getByRole('button', { name: '1 · Piano' }));
        expect(getBeatElement(5, 3)).toHaveAttribute('data-drop-zone', 'true');
      });

      it('shows the measures as drop zones while dragging a change, except the first', async () => {
        await openTimeline({
          initialEvents: [createTempoChangeEvent({ bpm: 100, measure: 3 })],
        });

        dragStart(getMeasure(3).getByRole('button', { name: '100 BPM' }));

        expect(getMeasureElement(2)).toHaveAttribute('data-drop-zone', 'true');
        expect(getMeasureElement(8)).toHaveAttribute('data-drop-zone', 'true');
        expect(getMeasureElement(1)).not.toHaveAttribute('data-drop-zone');
        expect(getBeatElement(5, 3)).not.toHaveAttribute('data-drop-zone');
      });

      it('highlights the drop zone under the pointer', async () => {
        await openTimeline({
          initialEvents: [
            createCueEvent({ id: 'cue', measure: 2, text: 'Verse' }),
            createTempoChangeEvent({ bpm: 100, measure: 3 }),
          ],
        });
        const dataTransfer = createDataTransfer();

        fireEvent.dragStart(getMeasure(2).getByRole('button', { name: '1 · Verse' }), {
          dataTransfer,
        });
        fireEvent.dragOver(getBeatElement(5, 2), { dataTransfer });
        expect(getBeatElement(5, 2)).toHaveAttribute('data-drop-over', 'true');
        expect(getBeatElement(5, 3)).not.toHaveAttribute('data-drop-over');

        fireEvent.dragLeave(getBeatElement(5, 2), { dataTransfer });
        expect(getBeatElement(5, 2)).not.toHaveAttribute('data-drop-over');

        fireEvent.dragEnd(getMeasure(2).getByRole('button', { name: '1 · Verse' }));
        fireEvent.dragStart(getMeasure(3).getByRole('button', { name: '100 BPM' }), {
          dataTransfer,
        });
        fireEvent.dragOver(getMeasureElement(6), { dataTransfer });
        expect(getMeasureElement(6)).toHaveAttribute('data-drop-over', 'true');

        fireEvent.dragLeave(getMeasureElement(6), { dataTransfer });
        expect(getMeasureElement(6)).not.toHaveAttribute('data-drop-over');
      });

      it('moves a tempo change that is dropped anywhere on a measure', async () => {
        await openTimeline({
          initialEvents: [createTempoChangeEvent({ bpm: 100, measure: 3 })],
        });

        drag(getMeasure(3).getByRole('button', { name: '100 BPM' }), getMeasureElement(6));

        expect(getMeasure(6).getByRole('button', { name: '100 BPM' })).toBeInTheDocument();
        expect(getMeasure(3).queryByRole('button', { name: '100 BPM' })).not.toBeInTheDocument();
        expect(getMeasureElement(6)).not.toHaveAttribute('data-drop-zone');
      });

      it('does not move a change to the first measure', async () => {
        await openTimeline({
          initialEvents: [createTimeSignatureChangeEvent({ measure: 3, timeSignature: '3/4' })],
        });

        drag(getMeasure(3).getByRole('button', { name: '3/4' }), getMeasureElement(1));

        expect(getMeasure(3).getByRole('button', { name: '3/4' })).toBeInTheDocument();
      });

      it('only drops a cue on a beat, not on the rest of the measure', async () => {
        await openTimeline({
          initialEvents: [createCueEvent({ beat: 2, id: 'cue', measure: 2, text: 'Verse' })],
        });

        drag(getMeasure(2).getByRole('button', { name: '2 · Verse' }), getMeasureElement(5));

        expect(getMeasure(2).getByRole('button', { name: '2 · Verse' })).toBeInTheDocument();
        expect(getMeasure(5).queryByRole('button', { name: /Verse/ })).not.toBeInTheDocument();
      });

      it('only drops a change on a measure, a drop on a beat moves it to that measure', async () => {
        await openTimeline({
          initialEvents: [createTempoChangeEvent({ bpm: 100, measure: 3 })],
        });

        drag(getMeasure(3).getByRole('button', { name: '100 BPM' }), getBeatElement(6, 3));

        expect(getMeasure(6).getByRole('button', { name: '100 BPM' })).toBeInTheDocument();
      });
    });

    it('shows the measures with their beats and the song tempo on the first one', async () => {
      await openTimeline({ bpm: 90, timeSignature: '3/4' });

      expect(screen.getByRole('button', { name: 'Timeline' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(getMeasure(1).getByText('90 BPM · 3/4')).toBeInTheDocument();
      expect(getMeasure(8).getAllByRole('button', { name: /^Select measure 8/ })).toHaveLength(3);
      expect(screen.queryByRole('group', { name: 'Measure 9' })).not.toBeInTheDocument();
    });

    it('shows events as chips in their measure', async () => {
      await openTimeline({
        initialEvents: [
          createCueEvent({ beat: 3, measure: 2, text: 'Verse' }),
          createTempoChangeEvent({ bpm: 100, measure: 3 }),
          createMidiButtonEvent({ beat: 2, measure: 3, midiEventId: '2' }),
        ],
      });

      expect(getMeasure(2).getByRole('button', { name: '3 · Verse' })).toBeInTheDocument();
      expect(getMeasure(3).getByRole('button', { name: '100 BPM' })).toBeInTheDocument();
      expect(getMeasure(3).getByRole('button', { name: '2 · EP' })).toBeInTheDocument();
    });

    it('follows time signature changes in the number of beats', async () => {
      await openTimeline({
        initialEvents: [createTimeSignatureChangeEvent({ measure: 3, timeSignature: '3/4' })],
        timeSignature: '4/4',
      });

      expect(getMeasure(2).getAllByRole('button', { name: /^Select measure/ })).toHaveLength(4);
      expect(getMeasure(3).getAllByRole('button', { name: /^Select measure/ })).toHaveLength(3);
      expect(getMeasure(3).getByRole('button', { name: '3/4' })).toBeInTheDocument();
    });

    it('shows where the count-in before a tempo change is spoken', async () => {
      await openTimeline({
        bpm: 60,
        initialEvents: [createTempoChangeEvent({ bpm: 100, measure: 3 })],
      });

      expect(getMeasure(2).getByRole('img', { name: 'Count-in at 100 BPM' })).toBeInTheDocument();
      expect(getMeasure(1).queryByRole('img')).not.toBeInTheDocument();
      expect(getMeasure(3).queryByRole('img')).not.toBeInTheDocument();
    });

    it('opens the editor in a dialog for a selected beat and adds an event', async () => {
      const user = await openTimeline();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await user.click(getMeasure(2).getByRole('button', { name: 'Select measure 2, beat 3' }));
      const dialog = within(screen.getByRole('dialog'));
      expect(dialog.getByRole('heading', { name: 'Measure 2, beat 3' })).toBeInTheDocument();

      await user.click(dialog.getByRole('button', { name: 'Add cue to measure 2, beat 3' }));
      await user.type(dialog.getByLabelText('Cue text'), 'Break');

      expect(getMeasure(2).getByRole('button', { name: '3 · Break' })).toBeInTheDocument();
      expect(
        getMeasure(2).getByRole('button', { name: 'Select measure 2, beat 3' }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('closes the dialog with the close button and with Escape', async () => {
      const user = await openTimeline();
      const beat = () => screen.getByRole('button', { name: 'Select measure 2, beat 3' });

      await user.click(beat());
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Close dialog' }),
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await user.click(beat());
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes the dialog when switching to the list', async () => {
      const user = await openTimeline();

      await user.click(screen.getByRole('button', { name: 'Select measure 2, beat 3' }));
      await user.click(screen.getByRole('button', { name: 'List' }));
      await user.click(screen.getByRole('button', { name: 'Timeline' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('edits an event by selecting its chip', async () => {
      const user = await openTimeline({
        initialEvents: [createCueEvent({ beat: 2, measure: 4, text: 'Verse' })],
      });

      await user.click(getMeasure(4).getByRole('button', { name: '2 · Verse' }));
      const editor = within(screen.getByRole('dialog'));
      await user.clear(editor.getByLabelText('Cue text'));
      await user.type(editor.getByLabelText('Cue text'), 'Chorus');

      expect(getMeasure(4).getByRole('button', { name: '2 · Chorus' })).toBeInTheDocument();

      await user.click(editor.getByRole('button', { name: 'Delete cue' }));

      expect(screen.queryByRole('button', { name: '2 · Chorus' })).not.toBeInTheDocument();
    });

    it('follows the events when the position is changed in the dialog', async () => {
      const user = await openTimeline({
        initialEvents: [createCueEvent({ beat: 2, measure: 4, text: 'Verse' })],
      });

      await user.click(getMeasure(4).getByRole('button', { name: '2 · Verse' }));
      const measure = within(screen.getByRole('dialog')).getByLabelText('Measure');
      await user.clear(measure);
      await user.type(measure, '6');
      await user.tab();

      expect(
        within(screen.getByRole('dialog')).getByRole('heading', { name: 'Measure 6, beat 2' }),
      ).toBeInTheDocument();
      expect(getMeasure(6).getByRole('button', { name: '2 · Verse' })).toBeInTheDocument();
    });

    it('does not offer changes on a beat other than 1 in the editor', async () => {
      const user = await openTimeline();

      await user.click(screen.getByRole('button', { name: 'Select measure 2, beat 2' }));

      expect(
        screen.getByRole('button', { name: 'Add tempo change to measure 2, beat 2' }),
      ).toBeDisabled();
    });

    it('moves an event by dragging its chip to another beat', async () => {
      await openTimeline({
        initialEvents: [createCueEvent({ beat: 1, id: 'cue', measure: 2, text: 'Verse' })],
      });

      drag(
        getMeasure(2).getByRole('button', { name: '1 · Verse' }),
        getMeasure(5).getByRole('button', { name: 'Select measure 5, beat 3' }),
      );

      expect(getMeasure(5).getByRole('button', { name: '3 · Verse' })).toBeInTheDocument();
      expect(getMeasure(2).queryByRole('button', { name: /Verse/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('snaps a dragged tempo change to beat 1 and keeps it off the first measure', async () => {
      await openTimeline({
        initialEvents: [createTempoChangeEvent({ bpm: 100, measure: 3 })],
      });

      drag(
        getMeasure(3).getByRole('button', { name: '100 BPM' }),
        getMeasure(1).getByRole('button', { name: 'Select measure 1, beat 2' }),
      );
      expect(getMeasure(3).getByRole('button', { name: '100 BPM' })).toBeInTheDocument();

      drag(
        getMeasure(3).getByRole('button', { name: '100 BPM' }),
        getMeasure(6).getByRole('button', { name: 'Select measure 6, beat 4' }),
      );
      expect(getMeasure(6).getByRole('button', { name: '100 BPM' })).toBeInTheDocument();
      expect(getMeasure(3).queryByRole('button', { name: '100 BPM' })).not.toBeInTheDocument();
    });

    it('marks events with problems', async () => {
      await openTimeline({ initialEvents: [createCueEvent({ measure: 2, text: '' })] });

      expect(getMeasure(2).getByRole('button', { name: '1 · Empty cue' })).toHaveClass(
        'border-red-400',
      );
    });

    it('adds a row of measures', async () => {
      const user = await openTimeline();

      await user.click(screen.getByRole('button', { name: 'More measures' }));

      expect(screen.getByRole('group', { name: 'Measure 12' })).toBeInTheDocument();
      expect(screen.queryByRole('group', { name: 'Measure 13' })).not.toBeInTheDocument();
    });

    it('covers the estimated length of the song', async () => {
      const user = userEvent.setup();
      render(
        <EventsTab
          bpm={120}
          estimatedMeasures={30}
          events={[]}
          midiEvents={[]}
          onEventsChange={vi.fn()}
        />,
      );
      await user.click(screen.getByRole('button', { name: 'Timeline' }));

      expect(screen.getByRole('group', { name: 'Measure 32' })).toBeInTheDocument();
    });
  });
});
