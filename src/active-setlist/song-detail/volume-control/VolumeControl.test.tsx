import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { VolumeControl } from './VolumeControl';

describe('VolumeControl', () => {
  const renderComponent = (volume = 80) => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    render(<VolumeControl label="Test" onChange={onChange} onCommit={onCommit} volume={volume} />);

    return { onChange, onCommit };
  };

  it('opens the slider when hovering with a mouse', async () => {
    const user = userEvent.setup();
    renderComponent();

    expect(screen.queryByRole('slider', { name: 'Test volume' })).not.toBeInTheDocument();

    await user.hover(screen.getByRole('button', { name: 'Mute Test' }));

    expect(screen.getByRole('slider', { name: 'Test volume' })).toHaveAttribute(
      'aria-valuenow',
      '80',
    );

    await user.unhover(screen.getByRole('button', { name: 'Mute Test' }));

    expect(screen.queryByRole('slider', { name: 'Test volume' })).not.toBeInTheDocument();
  });

  it('mutes and restores the volume when clicking with a mouse', async () => {
    const user = userEvent.setup();
    const { onChange, onCommit } = renderComponent();

    await user.click(screen.getByRole('button', { name: 'Mute Test' }));

    expect(onChange).toHaveBeenCalledWith(0);
    expect(onCommit).toHaveBeenCalledWith(0);
  });

  it('restores the previous volume when unmuting', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<VolumeControl label="Test" onChange={onChange} volume={80} />);

    await user.click(screen.getByRole('button', { name: 'Mute Test' }));
    rerender(<VolumeControl label="Test" onChange={onChange} volume={0} />);
    await user.click(screen.getByRole('button', { name: 'Unmute Test' }));

    expect(onChange).toHaveBeenLastCalledWith(80);
  });

  it('only toggles the slider, without muting, when tapping on a touch device', async () => {
    const user = userEvent.setup();
    const { onChange } = renderComponent();
    const button = screen.getByRole('button', { name: 'Mute Test' });

    await user.pointer({ keys: '[TouchA]', target: button });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('slider', { name: 'Test volume' })).toBeInTheDocument();

    await user.pointer({ keys: '[TouchA]', target: document.body });

    expect(screen.queryByRole('slider', { name: 'Test volume' })).not.toBeInTheDocument();
  });

  it('mutes with a long press on a touch device', async () => {
    const user = userEvent.setup();
    const { onChange, onCommit } = renderComponent();
    const button = screen.getByRole('button', { name: 'Mute Test' });

    await user.pointer({ keys: '[TouchA>]', target: button });
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(0), { timeout: 2000 });
    // Touch browsers also request a context menu after a long press
    fireEvent.contextMenu(button);
    await user.pointer({ keys: '[/TouchA]', target: button });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(0);
    expect(screen.queryByRole('slider', { name: 'Test volume' })).not.toBeInTheDocument();
  });
});
