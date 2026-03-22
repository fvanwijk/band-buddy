import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MockRouteProvider } from '../testUtils';
import { Home } from './Home';

describe('Home', () => {
  it('renders a CTA button', () => {
    render(<Home />, { wrapper: MockRouteProvider });

    expect(screen.getByRole('link', { name: 'Start the app' })).toBeInTheDocument();
  });
});
