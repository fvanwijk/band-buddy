import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { SettingHeading } from './SettingHeading';

describe('SettingHeading', () => {
  it('renders the heading content', () => {
    render(<SettingHeading>Zoom</SettingHeading>);

    expect(screen.getByText('Zoom')).toBeInTheDocument();
  });

  it('renders reset button content when provided', () => {
    render(
      <SettingHeading resetButton={<button type="button">Reset</button>}>Transpose</SettingHeading>,
    );

    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });
});
