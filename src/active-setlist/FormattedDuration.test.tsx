import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FormattedDuration } from './FormattedDuration';

describe('FormattedDuration', () => {
  it('renders seconds only', () => {
    const { container } = render(<FormattedDuration seconds={30} />);
    expect(container).toHaveTextContent('30s');
  });

  it('renders minutes and seconds', () => {
    const { container } = render(<FormattedDuration seconds={125} />);
    expect(container).toHaveTextContent('2m 5s');
  });

  it('renders hours, minutes, and seconds', () => {
    const { container } = render(<FormattedDuration seconds={3723} />);
    expect(container).toHaveTextContent('1h 2m 3s');
  });

  it('renders zero seconds', () => {
    const { container } = render(<FormattedDuration seconds={0} />);
    expect(container).toHaveTextContent('0s');
  });

  it('renders exactly one minute', () => {
    const { container } = render(<FormattedDuration seconds={60} />);
    expect(container).toHaveTextContent('1m 0s');
  });

  it('renders exactly one hour', () => {
    const { container } = render(<FormattedDuration seconds={3600} />);
    expect(container).toHaveTextContent('1h 0m 0s');
  });
});
