import { IconFileMusic } from '@tabler/icons-react';

import { useSheetMusic } from '../../hooks/useSheetMusic';
import { EmptyStateBlock } from '../../ui/EmptyStateBlock';
import { PdfViewer } from '../../ui/PdfViewer';

type SheetMusicTabProps = {
  sheetMusicFilename?: string;
  songId: string;
};

export function SheetMusicTab({ sheetMusicFilename, songId }: SheetMusicTabProps) {
  const { data: file, isLoading } = useSheetMusic(songId, !!sheetMusicFilename);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Loading sheet music...</p>
      </div>
    );
  }

  if (!sheetMusicFilename || !file) {
    return (
      <EmptyStateBlock icon={<IconFileMusic className="h-8 w-8" />}>
        No sheet music added yet
      </EmptyStateBlock>
    );
  }

  return <PdfViewer file={file} height="h-screen" />;
}
