import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { SongStat } from './SongStat';

describe('SongStat', () => {
  it('renders label and value', () => {
    render(<SongStat label="BPM" value={120} />);

    expect(screen.getByText('BPM')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });
});
