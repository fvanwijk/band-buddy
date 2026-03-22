import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { TransposePanel } from './TransposePanel';

type TransposePanelProps = {
  onTransposeChange?: (delta: number) => void;
  transpose?: number;
};

describe('TransposePanel', () => {
  const renderComponent = (props: TransposePanelProps = {}) =>
    render(
      <TransposePanel
        onTransposeChange={props.onTransposeChange || (() => {})}
        transpose={props.transpose ?? 0}
      />,
    );

  it('renders transpose value and controls', () => {
    renderComponent({ transpose: 2 });

    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transpose down' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transpose up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset transpose' })).toBeInTheDocument();
  });

  it('calls onTransposeChange for up and down buttons', async () => {
    const onTransposeChange = vi.fn();
    const user = userEvent.setup();

    renderComponent({ onTransposeChange });

    await user.click(screen.getByRole('button', { name: 'Transpose down' }));
    await user.click(screen.getByRole('button', { name: 'Transpose up' }));

    expect(onTransposeChange).toHaveBeenNthCalledWith(1, -1);
    expect(onTransposeChange).toHaveBeenNthCalledWith(2, 1);
  });

  it('does not render reset button when transpose is zero', () => {
    renderComponent();

    expect(screen.queryByRole('button', { name: 'Reset transpose' })).not.toBeInTheDocument();
  });

  it('resets transpose to zero when reset is clicked', async () => {
    const onTransposeChange = vi.fn();
    const user = userEvent.setup();

    renderComponent({ onTransposeChange, transpose: -3 });

    await user.click(screen.getByRole('button', { name: 'Reset transpose' }));

    expect(onTransposeChange).toHaveBeenCalledWith(3);
  });
});
