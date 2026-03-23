import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';

import { SheetMusicTab } from './SheetMusicTab';

const useSheetMusicMock = vi.fn();

vi.mock('../../../hooks/useSheetMusic', () => ({
  useSheetMusic: (songId: string, enabled: boolean) => useSheetMusicMock(songId, enabled),
}));

describe('SheetMusicTab', () => {
  it('renders loading state', () => {
    useSheetMusicMock.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<SheetMusicTab sheetMusicFilename="song.pdf" songId="1" />);

    expect(screen.getByText('Loading sheet music...')).toBeInTheDocument();
  });

  it('renders empty state when no filename is provided', () => {
    useSheetMusicMock.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<SheetMusicTab songId="1" />);

    expect(screen.getByText('No sheet music added yet')).toBeInTheDocument();
    expect(useSheetMusicMock).toHaveBeenCalledWith('1', false);
  });

  it('renders empty state when file is missing', () => {
    useSheetMusicMock.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<SheetMusicTab sheetMusicFilename="song.pdf" songId="1" />);

    expect(screen.getByText('No sheet music added yet')).toBeInTheDocument();
  });
});
