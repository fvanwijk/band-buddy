import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { AutocompleteField } from './AutocompleteField';

const options = [
  { label: 'Queen - Bohemian Rhapsody', value: '1' },
  { label: 'Earth, Wind & Fire - September', value: '2' },
  { label: 'Michael Jackson - Billie Jean', value: '3' },
];

describe('AutocompleteField', () => {
  const renderComponent = ({
    initialValue = '1',
    onChange = () => {},
    ...props
  }: Partial<Parameters<typeof AutocompleteField>[0]> & { initialValue?: string } = {}) => {
    const Wrapper = () => {
      const [value, setValue] = useState(initialValue);
      return (
        <AutocompleteField
          label="Song"
          onChange={(newValue) => {
            setValue(newValue);
            onChange(newValue);
          }}
          options={options}
          value={value}
          {...props}
        />
      );
    };
    return render(<Wrapper />);
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show the label of the selected option', () => {
    renderComponent({ initialValue: '2' });

    expect(screen.getByRole('combobox', { name: 'Song' })).toHaveValue(
      'Earth, Wind & Fire - September',
    );
  });

  it('should hide the label visually but keep it accessible when hideLabel is set', () => {
    renderComponent({ hideLabel: true });

    expect(screen.queryByText('Song')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Song' })).toBeInTheDocument();
  });

  it('should show all options when opened with the chevron button', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button'));

    expect(await screen.findAllByRole('option')).toHaveLength(3);
  });

  it('should filter options case-insensitively while typing', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByRole('combobox', { name: 'Song' });
    await user.clear(input);
    await user.type(input, 'bILLIE');

    expect(await screen.findAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Michael Jackson - Billie Jean' })).toBeVisible();
  });

  it('should show a message when no option matches', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByRole('combobox', { name: 'Song' });
    await user.clear(input);
    await user.type(input, 'does not exist');

    expect(await screen.findByText('No results found')).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('should call onChange with the value of the chosen option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderComponent({ onChange });

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByRole('option', { name: 'Michael Jackson - Billie Jean' }));

    expect(onChange).toHaveBeenCalledWith('3');
    expect(screen.getByRole('combobox', { name: 'Song' })).toHaveValue(
      'Michael Jackson - Billie Jean',
    );
  });

  it('should select the typed text on focus', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByRole<HTMLInputElement>('combobox', { name: 'Song' });
    await user.click(input);

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
  });

  it('should call onBlur when the input loses focus', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    renderComponent({ onBlur });

    await user.click(screen.getByRole('combobox', { name: 'Song' }));
    await user.tab();

    expect(onBlur).toHaveBeenCalled();
  });

  it('should show the error message instead of the helper text', () => {
    renderComponent({
      error: { message: 'Song is required', type: 'required' },
      helperText: 'Pick a song',
    });

    expect(screen.getByText('Song is required')).toBeInTheDocument();
    expect(screen.queryByText('Pick a song')).not.toBeInTheDocument();
  });

  it('should show the helper text when there is no error', () => {
    renderComponent({ helperText: 'Pick a song' });

    expect(screen.getByText('Pick a song')).toBeInTheDocument();
  });

  describe('dropdown placement', () => {
    const mockLayout = ({ bottom, listHeight, top }: Record<string, number>) => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        bottom,
        top,
      } as DOMRect);
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(listHeight);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    };

    it('should open below the input when there is enough space', async () => {
      mockLayout({ bottom: 100, listHeight: 240, top: 70 });
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(await screen.findByRole('listbox')).not.toHaveClass('bottom-full');
    });

    it('should open above the input when there is not enough space below', async () => {
      mockLayout({ bottom: 770, listHeight: 240, top: 740 });
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button'));

      expect(await screen.findByRole('listbox')).toHaveClass('bottom-full');
    });
  });
});
