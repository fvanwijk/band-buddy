import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';

import { createInstruments } from '../../../mocks/instruments';
import { MockRouteProvider } from '../../../testUtils';
import { MidiButtonDialog } from './MidiButtonDialog';

describe('MidiButtonDialog', () => {
  const renderComponent = (props: Partial<ComponentProps<typeof MidiButtonDialog>> = {}) =>
    render(
      <MidiButtonDialog
        instruments={createInstruments()}
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        {...props}
      />,
      { wrapper: MockRouteProvider },
    );

  it('renders the dialog with form fields and submits data', async () => {
    const user = userEvent.setup();

    const onSubmit = vi.fn();
    const onClose = vi.fn();

    renderComponent({ onClose, onSubmit });

    expect(screen.getByRole('heading', { name: 'Add MIDI Button' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add button' }));
    expect(screen.getByText('Label is required')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Button label*'), 'Test Button');

    // Program for Nora Stage that is default selected
    await user.selectOptions(screen.getByLabelText('Program 1'), 'A-21 (8)');

    await user.selectOptions(screen.getByLabelText('Instrument 1'), 'Yamaha Montage');

    const pc = screen.getByLabelText('Program Change number 1');
    await user.type(pc, '999');

    await user.click(screen.getByRole('button', { name: 'Add button' }));
    expect(screen.getByText('Program change must be at most 511')).toBeInTheDocument();
    await user.clear(pc);
    await user.type(pc, '12');

    await user.click(screen.getByRole('button', { name: 'Add MIDI event row' }));
    await user.selectOptions(screen.getByLabelText('Program 2'), '5');

    await user.click(screen.getByRole('button', { name: 'Add button' }));

    expect(onSubmit).toHaveBeenCalledWith({
      events: [
        { instrumentId: '1', programChange: 12 },
        { instrumentId: '0', programChange: 5 },
      ],
      label: 'Test Button',
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('renders edit mode and updates an existing MIDI button', async () => {
    const user = userEvent.setup();

    const onClose = vi.fn();
    const onSubmit = vi.fn();

    renderComponent({
      initialData: {
        events: [{ instrumentId: '0', programChange: 8 }],
        label: 'Piano',
      },
      onClose,
      onSubmit,
    });

    expect(screen.getByRole('heading', { name: 'Edit MIDI Button' })).toBeInTheDocument();
    expect(screen.getByLabelText('Button label*')).toHaveValue('Piano');
    expect(screen.getByRole('button', { name: 'Update button' })).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Button label*'));
    await user.type(screen.getByLabelText('Button label*'), 'Piano Lead');
    await user.click(screen.getByRole('button', { name: 'Update button' }));

    expect(onSubmit).toHaveBeenCalledWith({
      events: [{ instrumentId: '0', programChange: 8 }],
      label: 'Piano Lead',
    });
    expect(onClose).toHaveBeenCalled();
  });
});
