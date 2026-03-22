import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { createMidiEvents } from '../../../mocks/songs';
import type { MidiEvent } from '../../../types';
import { MidiButtonsDisplay, type MidiButtonsDisplayProps } from './MidiButtonsDisplay';

describe('MidiButtonsDisplay', () => {
  const renderComponent = (props: Partial<MidiButtonsDisplayProps> = {}) =>
    render(<MidiButtonsDisplay {...props} />);

  it('renders empty state when no MIDI events provided', () => {
    renderComponent({ midiEvents: [] });

    expect(screen.getByText('No MIDI buttons configured yet.')).toBeInTheDocument();
  });

  it('renders empty state when midiEvents is undefined', () => {
    renderComponent({ midiEvents: undefined });

    expect(screen.getByText('No MIDI buttons configured yet.')).toBeInTheDocument();
  });

  it('renders buttons for each MIDI event', () => {
    const events = createMidiEvents();
    renderComponent({ midiEvents: events });

    expect(screen.getByRole('button', { name: 'Piano' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Organ' })).toBeInTheDocument();
  });

  it('triggers onTriggerEvent callback when button is clicked', async () => {
    const user = userEvent.setup();
    const onTriggerEvent = vi.fn();
    const events = createMidiEvents();
    renderComponent({ midiEvents: events, onTriggerEvent });

    await user.click(screen.getByRole('button', { name: 'EP' }));

    expect(onTriggerEvent).toHaveBeenCalledOnce();
    expect(onTriggerEvent).toHaveBeenCalledWith(events[1]);
  });

  it('triggers onTriggerEvent with correct event for each button', async () => {
    const user = userEvent.setup();
    const onTriggerEvent = vi.fn();
    const events = createMidiEvents();
    renderComponent({ midiEvents: events, onTriggerEvent });

    await user.click(screen.getByRole('button', { name: 'Piano' }));
    expect(onTriggerEvent).toHaveBeenCalledWith(events[0]);

    await user.click(screen.getByRole('button', { name: 'Organ' }));
    expect(onTriggerEvent).toHaveBeenCalledWith(events[2]);
  });

  it('shows warning alert when some MIDI buttons are disabled', () => {
    const isDisabled = (event: MidiEvent) => event.id === '2';
    renderComponent({
      isDisabled,
      midiEvents: createMidiEvents(),
    });

    expect(
      screen.getByText(
        'Some MIDI buttons are disabled because their MIDI device is not available.',
      ),
    ).toBeInTheDocument();
  });

  it('disables buttons based on isDisabled predicate', () => {
    const events = createMidiEvents();
    const isDisabled = (event: MidiEvent) => event.id === '2';
    renderComponent({
      isDisabled,
      midiEvents: events,
    });

    expect(screen.getByRole('button', { name: 'Piano' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'EP' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Organ' })).not.toBeDisabled();
  });

  it('does not show warning alert when isDisabled is undefined', () => {
    const events = createMidiEvents();
    renderComponent({
      isDisabled: undefined,
      midiEvents: events,
    });

    expect(
      screen.queryByText(
        'Some MIDI buttons are disabled because their MIDI device is not available.',
      ),
    ).not.toBeInTheDocument();
  });

  it('does not show warning alert when all buttons are enabled', () => {
    const events = createMidiEvents();
    const isDisabled = () => false;
    renderComponent({
      isDisabled,
      midiEvents: events,
    });

    expect(
      screen.queryByText(
        'Some MIDI buttons are disabled because their MIDI device is not available.',
      ),
    ).not.toBeInTheDocument();
  });

  it('renders help text explaining MIDI button functionality', () => {
    const events = createMidiEvents();
    renderComponent({ midiEvents: events });

    expect(
      screen.getByText(
        'Click buttons to send MIDI program change events to the selected instrument.',
      ),
    ).toBeInTheDocument();
  });

  it('handles missing onTriggerEvent callback gracefully', async () => {
    const user = userEvent.setup();
    const events = createMidiEvents();
    renderComponent({
      midiEvents: events,
      onTriggerEvent: undefined,
    });

    // Should not throw when clicking button without callback
    await expect(
      user.click(screen.getByRole('button', { name: 'Piano' })),
    ).resolves.toBeUndefined();
  });
});
