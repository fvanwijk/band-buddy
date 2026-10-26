import { render, screen, within } from '@testing-library/react';
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
});
