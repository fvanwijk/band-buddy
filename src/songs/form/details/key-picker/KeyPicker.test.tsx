import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { KeyPicker } from './KeyPicker';

describe('KeyPicker', () => {
  const renderComponent = (props: Partial<Parameters<typeof KeyPicker>[0]> = {}) =>
    render(<KeyPicker label="Key" onChange={() => {}} {...props} />);

  it('renders major keys on the outer ring and minor keys on the inner ring', () => {
    renderComponent();

    expect(screen.getByRole('radiogroup', { name: 'Key' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'C major' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'A minor' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'F♯ major' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'G♭ major' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(29);
  });

  it('selects the stored key', () => {
    renderComponent({ note: 'A', quality: 'm' });

    expect(screen.getByRole('radio', { name: 'A minor' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'A major' })).not.toBeChecked();
  });

  it('does not select a slice when the stored spelling differs', () => {
    renderComponent({ note: 'G#', quality: '' });

    expect(screen.getByRole('radio', { name: 'A♭ major' })).not.toBeChecked();
    expect(screen.getByText('G♯')).toBeInTheDocument();
  });

  it('selects the stored spelling of a minor key', () => {
    renderComponent({ note: 'Ab', quality: 'm' });

    expect(screen.getByRole('radio', { name: 'A♭ minor' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'G♯ minor' })).not.toBeChecked();
  });

  it('selects the exact spelling when an enharmonic key is stored', () => {
    renderComponent({ note: 'Gb', quality: '' });

    expect(screen.getByRole('radio', { name: 'G♭ major' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'F♯ major' })).not.toBeChecked();
  });

  it('reports note and quality when a key is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderComponent({ onChange });

    await user.click(screen.getByRole('radio', { name: 'E minor' }));

    expect(onChange).toHaveBeenCalledWith('E', 'm');
  });

  it('does not report a change when the selected key is clicked again', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderComponent({ note: 'Ab', onChange, quality: '' });

    await user.click(screen.getByRole('radio', { name: 'A♭ major' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('replaces a differently spelled stored key when its slice is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderComponent({ note: 'G#', onChange, quality: '' });

    await user.click(screen.getByRole('radio', { name: 'A♭ major' }));

    expect(onChange).toHaveBeenCalledWith('Ab', '');
  });

  it('moves around the circle with the arrow keys', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderComponent({ note: 'C', onChange, quality: '' });

    screen.getByRole('radio', { name: 'C major' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('G', '');

    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('F', '');
  });

  it('switches to the relative minor with the down arrow', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderComponent({ note: 'C', onChange, quality: '' });

    screen.getByRole('radio', { name: 'C major' }).focus();
    await user.keyboard('{ArrowDown}');

    expect(onChange).toHaveBeenCalledWith('A', 'm');
  });

  it('shows the error message', () => {
    renderComponent({ error: { message: 'Key is required', type: 'required' } });

    expect(screen.getByText('Key is required')).toBeInTheDocument();
  });
});
