import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { ZoomPanel } from './ZoomPanel';

describe('ZoomPanel', () => {
  it('renders zoom value and slider labels', () => {
    const onZoomChange = vi.fn();

    render(<ZoomPanel onZoomChange={onZoomChange} zoom={1.25} />);

    expect(screen.getByText('Zoom')).toBeInTheDocument();
    expect(screen.getByText('1.25×')).toBeInTheDocument();
    expect(screen.getByText('0.75×')).toBeInTheDocument();
    expect(screen.getByText('2×')).toBeInTheDocument();
  });

  it('calls onZoomChange when slider changes', () => {
    const onZoomChange = vi.fn();

    render(<ZoomPanel onZoomChange={onZoomChange} zoom={1} />);

    fireEvent.change(screen.getByRole('slider', { name: 'Zoom' }), {
      target: { value: '1.4' },
    });

    expect(onZoomChange).toHaveBeenCalledWith(1.4);
  });

  it('shows and uses reset button when zoom is not default', async () => {
    const onZoomChange = vi.fn();
    const user = userEvent.setup();

    render(<ZoomPanel onZoomChange={onZoomChange} zoom={1.4} />);

    await user.click(screen.getByTitle('Reset zoom to 1×'));

    expect(onZoomChange).toHaveBeenCalledWith(1);
  });

  it('hides reset button when zoom is default', () => {
    const onZoomChange = vi.fn();

    render(<ZoomPanel onZoomChange={onZoomChange} zoom={1} />);

    expect(screen.queryByTitle('Reset zoom to 1×')).not.toBeInTheDocument();
  });
});
