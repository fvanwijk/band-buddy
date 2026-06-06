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
    await user.selectOptions(screen.getByLabelText('Program*'), 'A-21 (8)');

    await user.selectOptions(screen.getByLabelText('Instrument*'), 'Yamaha Montage');

    const pc = screen.getByLabelText('Program Change number*');
    await user.type(pc, '999');

    await user.click(screen.getByRole('button', { name: 'Add button' }));
    expect(screen.getByText('Program change must be at most 511')).toBeInTheDocument();
    await user.clear(pc);
    await user.type(pc, '12');

    await user.click(screen.getByRole('button', { name: 'Add button' }));

    expect(onSubmit).toHaveBeenCalledWith({
      instrumentId: '1',
      label: 'Test Button',
      programChange: 12,
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('renders edit mode and updates an existing MIDI button', async () => {
    const user = userEvent.setup();

    const onClose = vi.fn();
    const onSubmit = vi.fn();

    renderComponent({
      initialData: {
        instrumentId: '0',
        label: 'Piano',
        programChange: 8,
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
      instrumentId: '0',
      label: 'Piano Lead',
      programChange: 8,
    });
    expect(onClose).toHaveBeenCalled();
  });
});
