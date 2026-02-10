import { IconFileMusic } from '@tabler/icons-react';

import { useObjectUrl } from '../../hooks/useObjectUrl';
import { useSheetMusic } from '../../hooks/useSheetMusic';
import { EmptyStateBlock } from '../../ui/EmptyStateBlock';

type SheetMusicTabProps = {
  sheetMusicFilename?: string;
  songId: string;
};

export function SheetMusicTab({ sheetMusicFilename, songId }: SheetMusicTabProps) {
  const { data: file, isLoading } = useSheetMusic(songId, !!sheetMusicFilename);
  const pdfUrl = useObjectUrl(file);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Loading sheet music...</p>
      </div>
    );
  }

  if (!sheetMusicFilename || !pdfUrl) {
    return (
      <EmptyStateBlock icon={<IconFileMusic className="h-8 w-8" />}>
        No sheet music added yet
      </EmptyStateBlock>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-300">{sheetMusicFilename}</p>

      <iframe
        className="h-screen w-full rounded-lg border border-slate-800"
        src={pdfUrl}
        title="Sheet Music"
      />
    </div>
  );
}
