import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AddMidiButtonDialog } from './AddMidiButtonDialog';
import { createInstruments } from '../../../mocks/instruments';
import { MockRouteProvider } from '../../../testUtils';

describe('AddMidiButtonDialog', () => {
  it('renders the dialog with form fields and submits data', async () => {
    const user = userEvent.setup();

    const onAdd = vi.fn();
    const onClose = vi.fn();

    render(
      <AddMidiButtonDialog
        instruments={createInstruments()}
        isOpen={true}
        onAdd={onAdd}
        onClose={onClose}
      />,
      { wrapper: MockRouteProvider },
    );

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

    expect(onAdd).toHaveBeenCalledWith({
      instrumentId: '1',
      label: 'Test Button',
      programChange: 12,
    });

    expect(onClose).toHaveBeenCalled();
  });
});
