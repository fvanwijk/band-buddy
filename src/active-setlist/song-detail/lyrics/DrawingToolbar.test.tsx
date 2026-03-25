import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { DrawingToolbar, colorOptions, type DrawingToolbarProps } from './DrawingToolbar';

describe('DrawingToolbar', () => {
  const renderComponent = (props: Partial<DrawingToolbarProps> = {}) =>
    render(
      <DrawingToolbar
        mode="idle"
        onClear={vi.fn()}
        onColorSelect={vi.fn()}
        onModeChange={vi.fn()}
        selectedColor="#ef4444"
        {...props}
      />,
    );

  it('renders color picker button with selected color label as title', () => {
    renderComponent({ selectedColor: '#22c55e' });

    expect(screen.getByRole('button', { name: 'Green' })).toBeInTheDocument();
  });

  it('calls onModeChange with idle when Cancel is clicked', async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();
    renderComponent({ onModeChange });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onModeChange).toHaveBeenCalledWith('idle');
  });

  it('calls onModeChange with pen when Pen is clicked', async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();
    renderComponent({ onModeChange });

    await user.click(screen.getByRole('button', { name: 'Pen' }));

    expect(onModeChange).toHaveBeenCalledWith('pen');
  });

  it('calls onModeChange with eraser when Eraser is clicked', async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();
    renderComponent({ onModeChange });

    await user.click(screen.getByRole('button', { name: 'Eraser' }));

    expect(onModeChange).toHaveBeenCalledWith('eraser');
  });

  it('calls onClear when Clear button is clicked', async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();
    renderComponent({ onClear });

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('opens color menu when color button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Red' }));

    for (const option of colorOptions) {
      expect(screen.getByRole('menuitem', { name: option.label })).toBeInTheDocument();
    }
  });

  it('calls onColorSelect with selected color value', async () => {
    const onColorSelect = vi.fn();
    const user = userEvent.setup();
    renderComponent({ onColorSelect });

    await user.click(screen.getByRole('button', { name: 'Red' }));
    await user.click(screen.getByRole('menuitem', { name: 'Blue' }));

    expect(onColorSelect).toHaveBeenCalledWith('#3b82f6');
  });
});
