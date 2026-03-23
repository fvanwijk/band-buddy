import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { ResetButton } from './ResetButton';

describe('ResetButton', () => {
  it('renders a button with the provided title', () => {
    const onClick = vi.fn();

    render(<ResetButton onClick={onClick} title="Reset zoom" />);

    expect(screen.getByTitle('Reset zoom')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<ResetButton onClick={onClick} title="Reset transpose" />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
