import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';

import { createInstrument, createInstruments } from '../../../mocks/instruments';
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

    await user.selectOptions(screen.getByDisplayValue('Nord Stage 4'), 'Yamaha Montage');

    const pc = await screen.findByRole('spinbutton', { name: /Program Change number 1/ });
    await user.type(pc, '999');

    await user.click(screen.getByRole('button', { name: 'Add button' }));
    expect(screen.getByText('Program change must be at most 511')).toBeInTheDocument();
    await user.clear(pc);
    await user.type(pc, '12');

    await user.click(screen.getByRole('button', { name: 'Add MIDI event row' }));
    const secondRowProgram = screen.getAllByRole('combobox').at(-1);
    if (!secondRowProgram) {
      throw new Error('Second row program select not found');
    }
    await user.selectOptions(secondRowProgram, '5');

    await user.click(screen.getByRole('button', { name: 'Add button' }));

    expect(onSubmit).toHaveBeenCalledWith({
      events: [
        { instrumentId: '1', programChange: 12, type: 'programChange' },
        { instrumentId: '0', programChange: 5, type: 'programChange' },
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

  it('submits NRPN action data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderComponent({ onSubmit });

    await user.type(screen.getByLabelText('Button label*'), 'NRPN Test');
    await user.selectOptions(screen.getByDisplayValue('Program Change'), 'NRPN');
    const nrpnParameterMsb = await screen.findByRole('spinbutton', {
      name: /NRPN parameter MSB 1/,
    });
    await user.clear(nrpnParameterMsb);
    await user.type(nrpnParameterMsb, '1');
    const nrpnParameterLsb = await screen.findByRole('spinbutton', {
      name: /NRPN parameter LSB 1/,
    });
    await user.clear(nrpnParameterLsb);
    await user.type(nrpnParameterLsb, '7');
    const nrpnValueMsb = await screen.findByRole('spinbutton', { name: /NRPN value MSB 1/ });
    await user.clear(nrpnValueMsb);
    await user.type(nrpnValueMsb, '64');
    const nrpnValueLsb = await screen.findByRole('spinbutton', { name: /NRPN value LSB 1/ });
    await user.clear(nrpnValueLsb);
    await user.type(nrpnValueLsb, '3');

    await user.click(screen.getByRole('button', { name: 'Add button' }));

    expect(onSubmit).toHaveBeenCalledWith({
      events: [
        {
          instrumentId: '0',
          parameterLsb: 7,
          parameterMsb: 1,
          type: 'nrpn',
          valueLsb: 3,
          valueMsb: 64,
        },
      ],
      label: 'NRPN Test',
    });
  });

  it('applies Rev2 template and submits CC action', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderComponent({
      instruments: [createInstrument({ id: 'rev2', name: 'Prophet Rev2' })],
      onSubmit,
    });

    await user.type(screen.getByLabelText('Button label*'), 'Rev2 Bank');
    await user.selectOptions(screen.getByDisplayValue('Program Change'), 'Control Change');
    const controllerSelect = screen.getByDisplayValue('Bank Select (32)');
    await user.selectOptions(controllerSelect, 'Bank Select (32)');
    const ccValueSelect = screen.getByDisplayValue('User Bank 1');
    await user.selectOptions(ccValueSelect, 'Factory Bank 2');

    await user.click(screen.getByRole('button', { name: 'Add button' }));

    expect(onSubmit).toHaveBeenCalledWith({
      events: [
        {
          controller: 32,
          instrumentId: 'rev2',
          type: 'controlChange',
          value: 5,
        },
      ],
      label: 'Rev2 Bank',
    });
  });
});
