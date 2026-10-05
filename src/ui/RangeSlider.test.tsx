import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { RangeSlider } from './RangeSlider';

describe('RangeSlider', () => {
  const renderComponent = (props: Partial<Parameters<typeof RangeSlider>[0]> = {}) =>
    render(
      <RangeSlider
        max={10}
        maxThumbLabel="Maximum"
        min={0}
        minThumbLabel="Minimum"
        onValueChange={() => {}}
        step={0.5}
        value={[2, 8]}
        {...props}
      />,
    );

  it('renders a thumb for the minimum and the maximum', () => {
    renderComponent();

    expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '2');
    expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '8');
  });

  it('changes the minimum with the keyboard', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderComponent({ onValueChange });

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(onValueChange).toHaveBeenCalledWith([2.5, 8]);
  });

  it('changes the maximum with the keyboard', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderComponent({ onValueChange });

    await user.tab();
    await user.tab();
    await user.keyboard('{ArrowLeft}');

    expect(onValueChange).toHaveBeenCalledWith([2, 7.5]);
  });
});
