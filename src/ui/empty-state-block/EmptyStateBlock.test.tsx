import { IconError404 } from '@tabler/icons-react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { EmptyStateBlock, type EmptyStateBlockProps } from './EmptyStateBlock';

describe('EmptyStateBlock', () => {
  const renderComponent = (props: Partial<EmptyStateBlockProps> = {}) =>
    render(<EmptyStateBlock icon={<IconError404 />} {...props} />);

  it('renders children', () => {
    renderComponent({ children: 'No items found' });

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders icon', () => {
    const { container } = renderComponent({ icon: <div data-testid="test-icon" /> });

    expect(container.querySelector('[data-testid="test-icon"]')).toBeInTheDocument();
  });
});
