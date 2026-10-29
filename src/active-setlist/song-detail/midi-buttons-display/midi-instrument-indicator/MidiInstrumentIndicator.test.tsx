import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vite-plus/test';

import {
  MidiInstrumentIndicator,
  type MidiInstrumentIndicatorProps,
} from './MidiInstrumentIndicator';

describe('MidiInstrumentIndicator', () => {
  const renderComponent = (props: Partial<MidiInstrumentIndicatorProps> = {}) =>
    render(<MidiInstrumentIndicator isOnline name="Nord Stage 4" {...props} />);

  it('shows the instrument name and online status in a tooltip on hover', async () => {
    const user = userEvent.setup();
    renderComponent();

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.hover(screen.getByLabelText('Nord Stage 4 (online)'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Nord Stage 4 (online)');
  });

  it('shows the offline status in the tooltip', async () => {
    const user = userEvent.setup();
    renderComponent({ isOnline: false });

    await user.hover(screen.getByLabelText('Nord Stage 4 (offline)'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Nord Stage 4 (offline)');
  });
});
